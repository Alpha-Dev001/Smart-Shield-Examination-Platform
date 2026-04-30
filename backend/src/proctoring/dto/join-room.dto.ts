import { IsEnum, IsUUID } from 'class-validator';
import { Role } from '@prisma/client';

export class JoinRoomDto {
  @IsUUID()
  sessionId: string;

  @IsEnum(Role)
  role: Role;
}
