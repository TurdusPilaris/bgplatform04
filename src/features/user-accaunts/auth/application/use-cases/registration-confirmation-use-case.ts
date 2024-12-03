import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CodeConfirmationModel } from '../../api/models/input/code.confirmation.model';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { UsersSqlRepository } from '../../../users/infrastructure/sql/users.sql.repositories';

export class RegistrationConfirmationCommand {
  constructor(public inputCode: CodeConfirmationModel) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(private usersSqlRepository: UsersSqlRepository) {}
  async execute(
    command: RegistrationConfirmationCommand,
  ): Promise<InterlayerNotice> {
    const foundedUser = await this.usersSqlRepository.findByCodeConfirmation(
      command.inputCode.code,
    );

    if (!foundedUser) {
      const result = new InterlayerNotice(null);
      result.addError('Not found user', 'code', 400);
      return result;
    }
    if (foundedUser.emailConfirmation.isConfirmed) {
      const result = new InterlayerNotice(null);
      result.addError('Code confirmation already been applied', 'code', 400);
      return result;
    }
    if (foundedUser.emailConfirmation.expirationDate < new Date()) {
      const result = new InterlayerNotice(null);
      result.addError('Code confirmation is expired', 'code', 400);
      return result;
    }

    await this.usersSqlRepository.updateConfirmation(foundedUser.id);

    return new InterlayerNotice(null);
  }
}
