import { IsString, Length } from '@nestjs/class-validator';

export class PostCreateInputModel {
  @IsString()
  @Length(1, 30, { message: 'Title is not correct' })
  title: string;
  @Length(1, 100, { message: 'Short description is not correct' })
  shortDescription: string;
  @Length(1, 1000, { message: 'Content is not correct' })
  content: string;
  @IsString()
  blogId: string;
}
