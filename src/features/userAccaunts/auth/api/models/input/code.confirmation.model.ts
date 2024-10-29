import { IsString, Length } from '@nestjs/class-validator';

export class CodeConfirmationModel {
  @IsString()
  @Length(36, 36, { message: 'code confirmation is not correct' })
  code: string;
}
