import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityRepository } from '../../infrastucture/security.repository';
import { SecuritySqlRepository } from '../../infrastucture/security.sql.repository';
import { SecurityTorRepository } from '../../infrastucture/security.tor.repository';

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
  constructor(
    private securityRepository: SecurityRepository,
    private securitySqlRepository: SecuritySqlRepository,
    private securityTorRepository: SecurityTorRepository,
  ) {}

  async execute(command: UpdateSessionCommand) {
    await this.securityTorRepository.updateSession(
      command.id,
      command.iat,
      command.exp,
    );
  }
}
