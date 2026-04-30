import {
  IsString,
  IsDateString,
  IsInt,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  MinLength,
} from 'class-validator';

export class UpdateExamDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  title?: string;

  @IsDateString()
  @IsOptional()
  startAt?: string;

  @IsInt()
  @Min(5)
  @Max(300)
  @IsOptional()
  duration?: number;

  @IsBoolean()
  @IsOptional()
  randomize?: boolean;
}
