import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { UsersTorRepository } from '../../../users/infrastructure/tor/users.tor.repository';

export class RegistrationConfirmationCommand {
  constructor(public code: string) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(private usersSqlRepository: UsersTorRepository) {}
  async execute(
    command: RegistrationConfirmationCommand,
  ): Promise<InterlayerNotice> {
    const foundedUser = await this.usersSqlRepository.findByCodeConfirmation(
      command.code,
    );

    if (!foundedUser) {
      const result = new InterlayerNotice(null);
      result.addError('Not found user', 'code', 400);
      return result;
    }
    if (foundedUser.isConfirmed) {
      const result = new InterlayerNotice(null);
      result.addError('Code confirmation already been applied', 'code', 400);
      return result;
    }
    if (foundedUser.expirationDate < new Date()) {
      const result = new InterlayerNotice(null);
      result.addError('Code confirmation is expired', 'code', 400);
      return result;
    }

    await this.usersSqlRepository.updateConfirmation(foundedUser.id);

    return new InterlayerNotice(null);
  }
}
