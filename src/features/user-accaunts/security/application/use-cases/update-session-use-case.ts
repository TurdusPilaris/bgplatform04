import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityRepository } from '../../infrastucture/security.repository';
import { SecuritySqlRepository } from '../../infrastucture/security.sql.repository';

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
  ) {}

  async execute(command: UpdateSessionCommand) {
    await this.securitySqlRepository.updateSession(
      command.id,
      command.iat,
      command.exp,
    );
  }
}
