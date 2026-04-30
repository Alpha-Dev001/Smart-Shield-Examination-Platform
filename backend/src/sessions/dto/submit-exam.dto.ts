import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SubmitAnswerDto } from './submit-answer.dto';

export class SubmitExamDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers: SubmitAnswerDto[];
}
