import { IsString, Length } from '@nestjs/class-validator';
import { Trim } from '../../../../../infrastructure/decorators/transform/trim';

export class CreatePostWithoutBlogIdInputModel {
  @Trim()
  @IsString()
  @Length(1, 30, { message: 'Title is not correct' })
  title: string;
  @Trim()
  @Length(1, 100, { message: 'Short description is not correct' })
  shortDescription: string;
  @Trim()
  @Length(1, 1000, { message: 'Content is not correct' })
  content: string;
}
