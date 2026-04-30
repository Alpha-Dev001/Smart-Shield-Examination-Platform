import { IsOptional, IsUUID, IsString, IsEnum } from 'class-validator';

export enum ResultSortBy {
  SCORE_ASC = 'score_asc',
  SCORE_DESC = 'score_desc',
  TIME_ASC = 'time_asc',
  TIME_DESC = 'time_desc',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
}

export class GetResultsDto {
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsOptional()
  @IsUUID()
  examId?: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptional()
  @IsEnum(ResultSortBy)
  sortBy?: ResultSortBy = ResultSortBy.SCORE_DESC;

  @IsOptional()
  @IsString()
  search?: string;
}
