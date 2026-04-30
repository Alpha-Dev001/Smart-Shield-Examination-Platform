import { IsString, Length } from 'class-validator';

export class JoinClassDto {
  @IsString()
  @Length(8, 8, { message: 'Join code must be exactly 8 characters' })
  joinCode: string;
}