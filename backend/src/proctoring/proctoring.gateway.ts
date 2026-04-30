import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ProctoringService } from './proctoring.service';
import { ProctoringEventDto, JoinRoomDto, HeartbeatDto } from './dto';
import { ProctoringEventType } from '@prisma/client';

// map of socketId → { studentId, sessionId }
// used to clean up when a socket disconnects
const socketMap = new Map<string, { studentId: string; sessionId: string }>();

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/proctoring',
})
@UsePipes(new ValidationPipe({ whitelist: true }))
export class ProctoringGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ProctoringGateway.name);

  // heartbeat interval — checks every 15 seconds
  private heartbeatInterval: NodeJS.Timeout;

  constructor(
    private proctoringService: ProctoringService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ── Gateway initialized ──────────────────────────────────────────────
  afterInit() {
    this.logger.log('Proctoring WebSocket gateway initialized');
    this.startHeartbeatChecker();
  }

  // ── New connection ───────────────────────────────────────────────────
  async handleConnection(client: Socket) {
    try {
      // extract and verify JWT from handshake
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.emit('error', { message: 'No token provided' });
        client.disconnect();
        return;
      }

      const payload = this.jwt.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      });

      // attach user info to socket data
      client.data.userId = payload.sub;
      client.data.role = payload.role;
      client.data.email = payload.email;

      this.logger.log(`Client connected: ${client.id} | user: ${payload.sub}`);
    } catch {
      client.emit('error', { message: 'Invalid or expired token' });
      client.disconnect();
    }
  }

  // ── Disconnection ────────────────────────────────────────────────────
  async handleDisconnect(client: Socket) {
    const info = socketMap.get(client.id);

    if (info && client.data.role === 'STUDENT') {
      const { studentId, sessionId } = info;

      this.logger.warn(
        `Student disconnected: ${studentId} | session: ${sessionId}`,
      );

      // notify teacher that student disconnected
      this.server
        .to(`session:${sessionId}:teacher`)
        .emit('student-disconnected', {
          studentId,
          email: client.data.email,
          at: new Date(),
        });

      // clean up heartbeat tracking
      this.proctoringService.cleanupStudent(sessionId, studentId);
      socketMap.delete(client.id);
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ── Student/Teacher joins a session room ─────────────────────────────
  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() dto: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    const role = client.data.role;

    if (role === 'TEACHER') {
      // teacher joins the monitoring room for this session
      const room = `session:${dto.sessionId}:teacher`;
      await client.join(room);

      client.emit('room-joined', {
        room,
        message: 'You are now monitoring this session',
      });

      this.logger.log(
        `Teacher ${userId} joined monitoring room for session ${dto.sessionId}`,
      );
    } else {
      // student joins the student room
      const room = `session:${dto.sessionId}:students`;
      await client.join(room);

      // track socket → student mapping for disconnect cleanup
      socketMap.set(client.id, {
        studentId: userId,
        sessionId: dto.sessionId,
      });

      // record initial heartbeat
      this.proctoringService.recordHeartbeat(dto.sessionId, userId);

      // notify teacher that student joined
      this.server
        .to(`session:${dto.sessionId}:teacher`)
        .emit('student-joined', {
          studentId: userId,
          email: client.data.email,
          at: new Date(),
        });

      client.emit('room-joined', {
        room,
        message: 'You have joined the exam session',
      });

      this.logger.log(
        `Student ${userId} joined session ${dto.sessionId}`,
      );
    }
  }

  // ── Student sends heartbeat ──────────────────────────────────────────
  @SubscribeMessage('heartbeat')
  handleHeartbeat(
    @MessageBody() dto: HeartbeatDto,
    @ConnectedSocket() client: Socket,
  ) {
    const studentId = client.data.userId;
    this.proctoringService.recordHeartbeat(dto.sessionId, studentId);

    // acknowledge heartbeat so client knows it was received
    client.emit('heartbeat-ack', { at: new Date() });
  }

  // ── Student reports a proctoring event ──────────────────────────────
  @SubscribeMessage('flag-event')
  async handleFlagEvent(
    @MessageBody() dto: ProctoringEventDto,
    @ConnectedSocket() client: Socket,
  ) {
    const studentId = client.data.userId;

    // save to database and increment flag count
    const event = await this.proctoringService.saveEvent(
      dto.sessionId,
      studentId,
      dto.type,
    );

    // push alert to teacher's room instantly
    this.server
      .to(`session:${dto.sessionId}:teacher`)
      .emit('student-flagged', {
        studentId,
        email: client.data.email,
        type: dto.type,
        at: new Date(),
      });

    this.logger.warn(
      `Flag event: ${dto.type} | student: ${studentId} | session: ${dto.sessionId}`,
    );

    return { received: true };
  }

  // ── Teacher broadcasts a message to all students ─────────────────────
  @SubscribeMessage('broadcast-message')
  handleBroadcast(
    @MessageBody() data: { sessionId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (client.data.role !== 'TEACHER') {
      throw new WsException('Only teachers can broadcast messages');
    }

    this.server
      .to(`session:${data.sessionId}:students`)
      .emit('teacher-message', {
        message: data.message,
        at: new Date(),
      });

    return { sent: true };
  }

  // ── Teacher kicks a student from the session ─────────────────────────
  @SubscribeMessage('kick-student')
  handleKickStudent(
    @MessageBody() data: { sessionId: string; studentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (client.data.role !== 'TEACHER') {
      throw new WsException('Only teachers can kick students');
    }

    // find the student's socket and disconnect them
    this.server
      .to(`session:${data.sessionId}:students`)
      .emit('kicked', {
        studentId: data.studentId,
        message: 'You have been removed from the exam by the teacher.',
      });

    this.logger.warn(
      `Teacher kicked student: ${data.studentId} | session: ${data.sessionId}`,
    );

    return { kicked: true };
  }

  // ── Session ended — notify all students ──────────────────────────────
  @SubscribeMessage('end-session')
  handleEndSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (client.data.role !== 'TEACHER') {
      throw new WsException('Only teachers can end sessions');
    }

    // notify all students the exam is over
    this.server
      .to(`session:${data.sessionId}:students`)
      .emit('session-ended', {
        message: 'The exam has ended. Please submit your answers.',
        at: new Date(),
      });

    return { ended: true };
  }

  // ── Internal: heartbeat checker ──────────────────────────────────────
  // Runs every 15 seconds and flags students who missed 3+ heartbeats
  private startHeartbeatChecker() {
    this.heartbeatInterval = setInterval(async () => {
      for (const [socketId, { studentId, sessionId }] of socketMap) {
        const isActive = this.proctoringService.isStudentActive(
          sessionId,
          studentId,
        );

        if (!isActive) {
          const missed = this.proctoringService.incrementMissed(
            sessionId,
            studentId,
          );

          this.logger.warn(
            `Missed heartbeat #${missed} | student: ${studentId} | session: ${sessionId}`,
          );

          // flag after 3 consecutive missed heartbeats
          if (missed >= 3) {
            await this.proctoringService.saveEvent(
              sessionId,
              studentId,
              ProctoringEventType.HEARTBEAT_MISSED,
            );

            // notify teacher
            this.server
              .to(`session:${sessionId}:teacher`)
              .emit('student-flagged', {
                studentId,
                type: ProctoringEventType.HEARTBEAT_MISSED,
                message: 'Student may have lost connection or closed the exam',
                at: new Date(),
              });

            // reset counter so we don't spam flags
            this.proctoringService.cleanupStudent(sessionId, studentId);
            socketMap.delete(socketId);
          }
        }
      }
    }, 15_000);
  }
}
