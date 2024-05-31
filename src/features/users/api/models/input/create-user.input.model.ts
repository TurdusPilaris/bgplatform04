import { IsString, Length } from '@nestjs/class-validator';
import { IsOptionalEmail } from '../../../../../infrastructure/decorators/validate/is-optional-email';

export class UserCreateModel {
  @IsString()
  @Length(3, 10, { message: 'Login is not correct' })
  login: string;
  @Length(6, 20, { message: 'Password is not correct' })
  password: string;
  @IsOptionalEmail()
  email: string;
}
