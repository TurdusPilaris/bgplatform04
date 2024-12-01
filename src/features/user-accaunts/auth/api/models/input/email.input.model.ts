import { IsEmail } from '@nestjs/class-validator';

export class EmailInputModel {
  @IsEmail()
  email: string;
}
