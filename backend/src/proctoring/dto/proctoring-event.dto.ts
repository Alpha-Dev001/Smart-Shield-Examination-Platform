import { IsEnum, IsUUID } from 'class-validator';
import { ProctoringEventType } from '@prisma/client';

export class ProctoringEventDto {
  @IsUUID()
  sessionId: string;

  @IsEnum(ProctoringEventType, {
    message:
      'type must be TAB_SWITCH, FULLSCREEN_EXIT, HEARTBEAT_MISSED, or CLIPBOARD_ATTEMPT',
  })
  type: ProctoringEventType;
}
