import {
  IsString,
  IsArray,
  IsInt,
  IsOptional,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateQuestionDto {
  @IsString()
  @MinLength(5)
  @IsOptional()
  text?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @IsOptional()
  answer?: any;

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
