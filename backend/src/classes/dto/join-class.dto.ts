import { IsString, Length } from 'class-validator';

export class JoinClassDto {
  @IsString()
  @Length(8, 8, { message: 'Invalid code' })
  joinCode: string;
}