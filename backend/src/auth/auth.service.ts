import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // ── Register ────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    // 1. check email is not taken
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email is already in use');

    // 2. hash password — never store plain text
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // 3. create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
      },
    });

    // 4. return token immediately — no need to login after register
    return this.signToken(user.id, user.email, user.role);
  }

  // ── Login ────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    // 1. find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // same error for both "not found" and "wrong password"
    // — never reveal which one failed
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // 2. compare password
    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    // 3. return token
    return this.signToken(user.id, user.email, user.role);
  }

  // ── Get current user profile ─────────────────────────────────────────
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        classId: true,
        createdAt: true,
        // never select password
      },
    });
    return user;
  }

  // ── Private helper ───────────────────────────────────────────────────
  private signToken(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return {
      access_token: this.jwt.sign(payload),
      user: { id: userId, email, role },
    };
  }
}