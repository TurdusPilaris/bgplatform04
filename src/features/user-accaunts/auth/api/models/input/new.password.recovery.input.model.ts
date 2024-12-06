import { IsString, Length } from '@nestjs/class-validator';

export class NewPasswordRecoveryInputModel {
  @IsString()
  @Length(36, 36, { message: 'code confirmation is not correct' })
  recoveryCode: string;
  @Length(6, 20, { message: 'password is not correct' })
  newPassword: string;
}
