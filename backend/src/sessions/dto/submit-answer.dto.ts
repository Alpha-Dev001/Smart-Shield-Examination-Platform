import { IsUUID, IsNotEmpty } from 'class-validator';

export class SubmitAnswerDto {
  @IsUUID()
  questionId: string;

  @IsNotEmpty({ message: 'Answer value cannot be empty' })
  value: any; // string for SHORT_ANSWER, boolean for TRUE_FALSE, string for MCQ
}
