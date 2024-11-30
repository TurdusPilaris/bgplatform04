import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityTorRepository } from '../../infrastucture/security.tor.repository';

export class DeleteSessionCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase
  implements ICommandHandler<DeleteSessionCommand>
{
  constructor(private securityTorRepository: SecurityTorRepository) {}

  async execute(command: DeleteSessionCommand) {
    await this.securityTorRepository.deleteNonCurrentSessions(
      command.userId,
      command.deviceId,
    );
  }
}
