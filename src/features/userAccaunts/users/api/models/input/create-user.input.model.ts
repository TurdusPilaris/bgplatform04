import { IsString, Length } from '@nestjs/class-validator';
import { Trim } from '../../../../../../infrastructure/decorators/transform/trim';
// import { NameIsExist } from '../../../../../../infrastructure/decorators/validate/name-is-exist.decorator';
import { IsOptionalEmail } from '../../../../../../infrastructure/decorators/validate/is-optional-email';

export class UserCreateModel {
  @Trim()
  @IsString()
  // @NameIsExist()
  @Length(3, 10, { message: 'Login is not correct' })
  login: string;

  @Length(6, 20, { message: 'Password is not correct' })
  password: string;

  @IsOptionalEmail()
  email: string;
}
