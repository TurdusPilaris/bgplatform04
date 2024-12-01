import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityTorRepository } from '../../../security/infrastucture/security.tor.repository';

export class LogoutCommand {
  constructor(
    public userId: string,
    public currentDeviceId: string,
  ) {}
}
@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(private securityTorRepository: SecurityTorRepository) {}

  async execute(command: LogoutCommand): Promise<any> {
    await this.securityTorRepository.deleteCurrentSessions(
      command.userId,
      command.currentDeviceId,
    );
  }
}
