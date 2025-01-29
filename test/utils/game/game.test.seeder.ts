import { UserSQL } from '../../../src/features/user-accaunts/users/domain/entities/user.sql.entity';
import { add } from 'date-fns';
import { v4 } from 'uuid';
import { InterlayerNotice } from '../../../src/base/models/Interlayer';

export const gameTestSeeder = (bcryptService, usersTorRepository) => ({
  async createAuthUser(nameUser: string): Promise<string> {
    const passwordHash = await bcryptService.generationHash(
      'nameUser' + '123456',
    );
    const userCreateSql = new UserSQL();
    userCreateSql.userName = nameUser;
    userCreateSql.email = `${nameUser}@gmail.com`;
    userCreateSql.passwordHash = passwordHash;
    userCreateSql.createdAt = new Date();
    userCreateSql.confirmationCode = v4();
    userCreateSql.expirationDate = add(new Date(), {
      hours: 99,
      minutes: 3,
    });
    userCreateSql.isConfirmed = true;
    return usersTorRepository.createUser(userCreateSql);
  },
});
