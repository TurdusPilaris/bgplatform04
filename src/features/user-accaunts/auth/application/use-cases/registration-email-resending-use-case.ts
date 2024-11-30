import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { v4 } from 'uuid';
import { add } from 'date-fns';
import { UsersTorRepository } from '../../../users/infrastructure/users.tor.repository';
import { BusinessService } from '../../../../../base/domain/business-service';

export class RegistrationEmailResendingCommand {
  constructor(public email: string) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements ICommandHandler<RegistrationEmailResendingCommand>
{
  constructor(
    private usersTorRepository: UsersTorRepository,
    private businessService: BusinessService,
  ) {}
  async execute(
    command: RegistrationEmailResendingCommand,
  ): Promise<InterlayerNotice> {
    const foundedUser = await this.usersTorRepository.findByLoginOrEmail(
      command.email,
    );

    if (!foundedUser) {
      const result = new InterlayerNotice(null);
      result.addError('Not found user', 'email', 400);
      return result;
    }
    if (foundedUser.isConfirmed) {
      const result = new InterlayerNotice(null);
      result.addError('Code confirmation already been applied', 'email', 400);
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
      this.businessService.sendRegisrtationEmail(
        command.email,
        newConfirmationCode,
      );
    } catch (e: unknown) {
      console.error('Send email error', e);
    }

    return new InterlayerNotice(null);
  }
}
