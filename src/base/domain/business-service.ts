import { EmailAdapter } from '../adapters/email-adapter';
import { EmailRouter } from '../email/email-router';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BusinessService {
  constructor(
    private emailRouter: EmailRouter,
    private emailAdapter: EmailAdapter,
  ) {}
  async sendRegisrtationEmail(email: string, confirmationCode: string) {
    const dataMail = this.emailRouter.getDataMailForRegisrtation(
      email,
      confirmationCode,
    );
    // await this.emailAdapter.sandMail(dataMail);
  }
  async sendRecoveryPassword(email: string, confirmationCode: string) {
    const dataMail = this.emailRouter.getDataMailForRecoveryPassword(
      email,
      confirmationCode,
    );
    // await this.emailAdapter.sandMail(dataMail);
  }
}
