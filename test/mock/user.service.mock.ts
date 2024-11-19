import { BcryptService } from '../../src/base/adapters/bcrypt-service';
import { BusinessServiceMock } from './business.service.mock';
import { UsersService } from '../../src/features/user-accaunts/users/application/users.service';
import { UsersSqlRepository } from '../../src/features/user-accaunts/users/infrastructure/users.sql.repositories';
import { UsersSqlQueryRepository } from '../../src/features/user-accaunts/users/infrastructure/users.sql.query-repositories';

//  .overrideProvider(UsersService)
//  .useValue(UserServiceMockObject)
export const UserServiceMockObject = {
  // sendMessageOnEmail(email: string) {
  //   console.log('Call mock method sendMessageOnEmail / MailService');
  //   return Promise.resolve(true);
  // },
  create() {
    return Promise.resolve('123');
  },
};

//  .overrideProvider(UsersService)
//  .useClass(UserServiceMock)
// or
// .overrideProvider(UsersService)
// .useFactory({
//      factory: (usersRepo: UsersRepository) => {
//          return new UserServiceMock(usersRepo);
//      },
//      inject: [UsersRepository]
//      }
//     )

export class UserServiceMock extends UsersService {
  constructor(
    usersSqlRepository: UsersSqlRepository,
    bcryptService: BcryptService,
    businessService: BusinessServiceMock,
    usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {
    super(
      usersSqlRepository,
      bcryptService,
      businessService,
      usersSqlQueryRepository,
    );
  }

  // sendMessageOnEmail() {
  //   console.log(
  //     'Call mock method sendMessageOnEmail / MailService, for specific test',
  //   );
  //   return Promise.resolve(true);
  // }
}
