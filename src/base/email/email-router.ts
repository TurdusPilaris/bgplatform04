import { registrationEmail } from '../adapters/emailExamples';
import { DataMailType } from './models/mail.types';
import { Injectable } from '@nestjs/common';
@Injectable()
export class EmailRouter {
  getDataMailForRegisrtation(
    email: string,
    confirmationCode: string,
  ): DataMailType {
    const textMessage = `<h1>Thank for your registration</h1><p>To finish registration please follow the link below:<a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a></p>`;
    return {
      from: '"Blogger platform"',
      to: email,
      subject: registrationEmail,
      html: textMessage,
    };
  }
  getDataMailForRecoveryPassword(
    email: string,
    confirmationCode: string,
  ): DataMailType {
    const textMessage = `<h1>Password recovery</h1><p>To finish password recovery please follow the link below:<a href='https://somesite.com/password-recovery?recoveryCode=${confirmationCode}'>recovery password</a></p>`;
    return {
      from: '"Blogger platform"',
      to: email,
      subject: registrationEmail,
      html: textMessage,
    };
  }
}
