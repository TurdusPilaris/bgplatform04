export class UserSQL {
  id: string;

  login: string;

  accountData: UserAccountData;

  emailConfirmation: UserEmailConfirmation;
}

export class UserAccountData {
  userName: string;

  email: string;

  passwordHash: string;

  createdAt: Date;
}

export class UserEmailConfirmation {
  confirmationCode: string;

  expirationDate: Date;

  isConfirmed: boolean;
}
