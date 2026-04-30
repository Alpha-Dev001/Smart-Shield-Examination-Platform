import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @MinLength(3, { message: 'Class name must be at least 3 characters' })
  @MaxLength(50, { message: 'Class name must not exceed 50 characters' })
  name: string;
}