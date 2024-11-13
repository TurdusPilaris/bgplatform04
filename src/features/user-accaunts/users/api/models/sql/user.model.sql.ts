export class UserSQL {
  id: string;
  login: string;
  accountData: UserAccountData;
  emailConfirmation: UserEmailConfirmation;

  constructor(
    id: string,
    userName: string,
    email: string,
    passwordHash: string,
    createdAt: Date,
    confirmationCode: string,
    expirationDate: Date,
    isConfirmed: boolean,
  ) {
    this.id = id;
    this.login = userName;
    this.accountData = new UserAccountData(
      userName,
      email,
      passwordHash,
      createdAt,
    );
    this.emailConfirmation = new UserEmailConfirmation(
      confirmationCode,
      expirationDate,
      isConfirmed,
    );
  }
}

export class UserAccountData {
  userName: string;
  email: string;
  passwordHash: string;
  createdAt: Date;

  constructor(
    userName: string,
    email: string,
    passwordHash: string,
    createdAt: Date,
  ) {
    this.userName = userName;
    this.email = email;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt;
  }
}

export class UserEmailConfirmation {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;

  constructor(
    confirmationCode: string,
    expirationDate: Date,
    isConfirmed: boolean,
  ) {
    this.confirmationCode = confirmationCode;
    this.expirationDate = expirationDate;
    this.isConfirmed = isConfirmed;
  }
}

// Пример создания экземпляра UserSQL
// const user = new UserSQL(
//   'user-id-123',
//   'exampleUser',
//   'exampleUser',
//   'example@example.com',
//   'hashed_password',
//   new Date(),
//   'unique_code',
//   new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
//   false
// );
//
// console.log(user);
