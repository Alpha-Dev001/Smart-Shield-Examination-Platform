import { IsUUID, IsOptional } from 'class-validator';

export class ResultAnalyticsDto {
  @IsUUID()
  examId: string;

  @IsOptional()
  @IsUUID()
  classId?: string;
}
