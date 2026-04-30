import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { QuestionType } from '@prisma/client';

export class CreateQuestionDto {
  @IsEnum(QuestionType, {
    message: 'type must be MCQ, TRUE_FALSE, or SHORT_ANSWER',
  })
  type: QuestionType;

  @IsString()
  @MinLength(5, { message: 'Question text must be at least 5 characters' })
  text: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[]; // only required for MCQ

  @IsNotEmpty()
  answer: any; // correct answer — validated in service based on type

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  points?: number;

  @IsString()
  @IsOptional()
  explanation?: string;
}
