import { IsEmail, IsString, Length } from '@nestjs/class-validator';

export class EmailInputModel {
  @IsEmail()
  email: string;
}
