import { IsString, Length } from '@nestjs/class-validator';
import { Trim } from '../../../../../../infrastructure/decorators/transform/trim';

export class CreateCommentInputModel {
  @Trim()
  @IsString()
  @Length(20, 300, { message: 'content is not correct' })
  content: string;
}
