export class UserCreateSqlModel {
  userName: string;

  email: string;

  passwordHash: string;

  createdAt: Date;

  confirmationCode: string;

  expirationDate: Date;

  isConfirmed: boolean;
}
