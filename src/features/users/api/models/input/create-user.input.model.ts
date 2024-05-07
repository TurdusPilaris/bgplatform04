import { IsString, Length } from '@nestjs/class-validator';
import { IsOptionalEmail } from '../../../../../infrastructure/decorators/validate/is-optional-email';

export class UserCreateModel {
  @IsString()
  login: string;
  @Length(6, 20, { message: 'Password not correct' })
  password: string;
  @IsOptionalEmail()
  email: string;
}
