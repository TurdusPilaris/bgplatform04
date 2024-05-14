import { IsString, IsUrl, Length } from '@nestjs/class-validator';

export class BlogCreateInputModel {
  @IsString()
  @Length(1, 15, { message: 'Name is not correct' })
  name: string;
  @Length(1, 500, { message: 'Name is not correct' })
  description: string;
  @IsUrl()
  websiteUrl: string;
}
