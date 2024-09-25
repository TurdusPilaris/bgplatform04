import { UsersRepository } from '../../src/features/users/infrastructure/users.repository';
import {
  UsersService,
  // UsersServiceSettings,
} from '../../src/features/users/application/users.service';
import { BcryptService } from '../../src/base/adapters/bcrypt-service';
import { BusinessServiceMock } from './business.service.mock';

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
    usersRepository: UsersRepository,
    bcryptService: BcryptService,
    businessService: BusinessServiceMock,
  ) {
    super(usersRepository, bcryptService, businessService);
  }

  // sendMessageOnEmail() {
  //   console.log(
  //     'Call mock method sendMessageOnEmail / MailService, for specific test',
  //   );
  //   return Promise.resolve(true);
  // }
}
