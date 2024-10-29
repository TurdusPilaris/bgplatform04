import { IsString, Length } from '@nestjs/class-validator';

export class LoginInputModel {
  @IsString()
  @Length(1, 50, { message: 'loginOrEmail is not correct' })
  loginOrEmail: string;
  @Length(1, 50, { message: 'password is not correct' })
  password: string;
}
