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

export class CreateExamDto {
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  title: string;

  @IsDateString({}, { message: 'startAt must be a valid ISO date string' })
  startAt: string;

  @IsInt()
  @Min(5, { message: 'Exam must be at least 5 minutes long' })
  @Max(300, { message: 'Exam cannot exceed 300 minutes' })
  duration: number; // in minutes

  @IsBoolean()
  @IsOptional()
  randomize?: boolean;
}
