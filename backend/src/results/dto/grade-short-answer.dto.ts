import { IsInt, IsUUID, Min } from 'class-validator';

export class GradeShortAnswerDto {
  @IsUUID()
  sessionId: string;

  @IsUUID()
  studentId: string;

  @IsUUID()
  questionId: string;

  @IsInt()
  @Min(0)
  awardedPoints: number;
}

