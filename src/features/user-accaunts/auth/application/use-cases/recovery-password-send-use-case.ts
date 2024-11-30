import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { v4 } from 'uuid';
import { add } from 'date-fns';
import { UsersTorRepository } from '../../../users/infrastructure/users.tor.repository';
import { BusinessService } from '../../../../../base/domain/business-service';

export class RecoveryPasswordSendCommand {
  constructor(public email: string) {}
}

@CommandHandler(RecoveryPasswordSendCommand)
export class RecoveryPasswordSendUseCase
  implements ICommandHandler<RecoveryPasswordSendCommand>
{
  constructor(
    private usersTorRepository: UsersTorRepository,
    private businessService: BusinessService,
  ) {}
  async execute(
    command: RecoveryPasswordSendCommand,
  ): Promise<InterlayerNotice> {
    const foundedUser = await this.usersTorRepository.findByLoginOrEmail(
      command.email,
    );

    if (!foundedUser) {
      const result = new InterlayerNotice(null);
      result.addError('Not found user', 'code', 400);
      return result;
    }

    const newConfirmationCode = v4();

    await this.usersTorRepository.updateConfirmationCode(
      foundedUser.id,
      newConfirmationCode,
      add(new Date(), {
        hours: 58,
        minutes: 3,
      }),
    );

    try {
      this.businessService.sendRecoveryPassword(
        command.email,
        newConfirmationCode,
      );
    } catch (e: unknown) {
      console.error('Send email error', e);
    }

    return new InterlayerNotice(null);
  }
}
