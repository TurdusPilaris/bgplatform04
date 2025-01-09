import {
  ArrayNotEmpty,
  IsArray,
  IsString,
  Length,
} from '@nestjs/class-validator';
import { Trim } from '../../../../../../infrastructure/decorators/transform/trim';

export class QuestionInputModel {
  @Trim()
  @IsString()
  @Length(10, 500, { message: 'Name is not correct' })
  body: string;
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  correctAnswers: string[];
}
