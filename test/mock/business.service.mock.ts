import { BusinessService } from '../../src/base/domain/business-service';
import { EmailRouter } from '../../src/base/email/email-router';
import { EmailAdapter } from '../../src/base/adapters/email-adapter';

export class BusinessServiceMock extends BusinessService {
  constructor(emailRouter: EmailRouter, emailAdapter: EmailAdapter) {
    super(emailRouter, emailAdapter);
  }
  async sendRegisrtationEmail(email: string, confirmationCode: string) {
    console.log('Call mock method sendRegisrtationEmail / MailService');
    // return Promise.resolve(true);
  }
  async sendRecoveryPassword(email: string, confirmationCode: string) {
    console.log('Call mock method sendRecoveryPassword / MailService');
    // return Promise.resolve(true);
  }
}
