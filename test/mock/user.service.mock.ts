import { BcryptService } from '../../src/base/adapters/bcrypt-service';
import { BusinessServiceMock } from './business.service.mock';
import { UsersService } from '../../src/features/user-accaunts/users/application/users.service';
import { UsersSqlRepository } from '../../src/features/user-accaunts/users/infrastructure/users.sql.repositories';
import { UsersSqlQueryRepository } from '../../src/features/user-accaunts/users/infrastructure/users.sql.query-repositories';
import { UsersTorQueryRepository } from '../../src/features/user-accaunts/users/infrastructure/users.tor.query-repositories';
import { UsersTorRepository } from '../../src/features/user-accaunts/users/infrastructure/users.tor.repository';

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
    usersQueryRepository: UsersTorQueryRepository,
    usersTorRepository: UsersTorRepository,
  ) {
    super(
      usersSqlRepository,
      bcryptService,
      businessService,
      usersQueryRepository,
      usersTorRepository,
    );
  }

  // sendMessageOnEmail() {
  //   console.log(
  //     'Call mock method sendMessageOnEmail / MailService, for specific test',
  //   );
  //   return Promise.resolve(true);
  // }
}
