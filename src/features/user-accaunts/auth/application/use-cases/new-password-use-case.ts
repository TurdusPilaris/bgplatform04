import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CodeConfirmationModel } from '../../api/models/input/code.confirmation.model';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { UsersSqlRepository } from '../../../users/infrastructure/sql/users.sql.repositories';
import { NewPasswordRecoveryInputModel } from '../../api/models/input/new.password.recovery.input.model';
import { UsersTorRepository } from '../../../users/infrastructure/tor/users.tor.repository';
import { BcryptService } from '../../../../../base/adapters/bcrypt-service';

export class NewPasswordCommand {
  constructor(public inputModel: NewPasswordRecoveryInputModel) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(
    private usersSqlRepository: UsersTorRepository,
    private bcryptService: BcryptService,
  ) {}
  async execute(command: NewPasswordCommand): Promise<InterlayerNotice> {
    const foundedUser = await this.usersSqlRepository.findByCodeConfirmation(
      command.inputModel.recoveryCode,
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

    //create hash
    const passwordHash = await this.bcryptService.generationHash(
      command.inputModel.newPassword,
    );
    await this.usersSqlRepository.updateConfirmationAndPassword(
      foundedUser.id,
      passwordHash,
    );

    return new InterlayerNotice(null);
  }
}
