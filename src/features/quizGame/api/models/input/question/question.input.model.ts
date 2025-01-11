import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  Length,
} from '@nestjs/class-validator';
import { Trim } from '../../../../../../infrastructure/decorators/transform/trim';
import { Transform } from 'class-transformer';

export class QuestionInputModel {
  @Trim()
  @IsString()
  @Length(10, 500, { message: 'Name is not correct' })
  body: string;
  @Transform(({ value }) => (value === null ? [] : value))
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  correctAnswers: string[] | null;
}
