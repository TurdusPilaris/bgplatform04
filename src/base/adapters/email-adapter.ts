import { Injectable } from '@nestjs/common';
import { DataMailType } from '../email/models/mail.types';
import nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '../../settings/configuration';

@Injectable()
export class EmailAdapter {
  constructor(private configService: ConfigService<Configuration, true>) {}
  async sandMail(dataMail: DataMailType) {
    const authSettings = this.configService.get('authSettings', {
      infer: true,
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'testovaelena636@gmail.com',
        pass: authSettings.PASSWORD_FOR_EMAIL,
      },
    });

    return await transporter.sendMail(dataMail);
  }
}
