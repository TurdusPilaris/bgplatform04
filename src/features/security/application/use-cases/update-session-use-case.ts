import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityRepository } from '../../infrastucture/security.repository';

export class UpdateSessionCommand {
  constructor(
    public id: string,
    public iat: Date,
    public exp: Date,
  ) {}
}

@CommandHandler(UpdateSessionCommand)
export class UpdateSessionUseCase
  implements ICommandHandler<UpdateSessionCommand>
{
  constructor(private securityRepository: SecurityRepository) {}

  async execute(command: UpdateSessionCommand) {
    await this.securityRepository.updateSession(
      command.id,
      command.iat,
      command.exp,
    );
  }
}
