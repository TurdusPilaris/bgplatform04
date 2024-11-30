import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityTorRepository } from '../../infrastucture/security.tor.repository';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';

export class DeleteSessionByDeviceIdCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteSessionByDeviceIdCommand)
export class DeleteSessionByDeviceIdUseCase
  implements ICommandHandler<DeleteSessionByDeviceIdCommand>
{
  constructor(private securityTorRepository: SecurityTorRepository) {}

  async execute(command: DeleteSessionByDeviceIdCommand) {
    const session = await this.securityTorRepository.getSessionByDeviceID(
      command.deviceId,
    );

    if (!session) {
      const result = new InterlayerNotice(null);
      result.addError('Not found ip', 'ip', 404);
      return result;
    }

    if (session.userId !== command.userId) {
      const result = new InterlayerNotice(null);
      result.addError(
        'try to delete the deviceId of other user',
        'userId',
        403,
      );
      return result;
    }

    await this.securityTorRepository.deleteSessionByDeviceID(session.id);

    return new InterlayerNotice();
  }
}
