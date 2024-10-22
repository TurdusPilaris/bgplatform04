import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../../base/models/Interlayer';
import { SecurityRepository } from '../../infrastucture/security.repository';

export class CreateSessionCommand {
  constructor(
    public payload: any,
    public deviceName: string,
    public ip: string | undefined,
  ) {}
}

@CommandHandler(CreateSessionCommand)
export class CreateSessionUseCase
  implements ICommandHandler<CreateSessionCommand>
{
  constructor(private securityRepository: SecurityRepository) {}

  async execute(
    command: CreateSessionCommand,
  ): Promise<InterlayerNotice<string | null>> {
    if (!command.ip) {
      const result = new InterlayerNotice(null);
      result.addError('Not found ip', 'ip', 400);
      return result;
    }

    const session = await this.securityRepository.createSession(
      command.payload,
      command.deviceName,
      command.ip,
    );

    return new InterlayerNotice(session.id);
  }
}
