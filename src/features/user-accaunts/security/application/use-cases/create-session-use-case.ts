import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../../../base/models/Interlayer';
import { Sessions } from '../../domain/session.sql';
import { UsersTorRepository } from '../../../users/infrastructure/users.tor.repository';
import { SecurityTorRepository } from '../../infrastucture/security.tor.repository';

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
  constructor(
    private securityTorRepository: SecurityTorRepository,
    private usersTorRepository: UsersTorRepository,
  ) {}

  async execute(
    command: CreateSessionCommand,
  ): Promise<InterlayerNotice<string | null>> {
    if (!command.ip) {
      const result = new InterlayerNotice(null);
      result.addError('Not found ip', 'ip', 400);
      return result;
    }

    //mongo
    // const session = await this.securityRepository.createSession(
    //   command.payload,
    //   command.deviceName,
    //   command.ip,
    // );

    //sql
    // const sessionId = await this.securitySqlRepository.createSession(
    //   command.payload,
    //   command.deviceName,
    //   command.ip,
    // );

    //tor
    const newSession = new Sessions();
    newSession.userId = command.payload.userId;
    // newSession.user = await this.usersTorRepository.findById(
    //   command.payload.userId,
    // );
    newSession.deviceId = command.payload.deviceId;
    newSession.iat = new Date(command.payload.iat * 1000);
    newSession.deviceName = command.deviceName;
    newSession.ip = command.ip;
    newSession.exp = new Date(command.payload.exp * 1000);

    const sessionId =
      await this.securityTorRepository.createSession(newSession);
    return new InterlayerNotice(sessionId);
  }
}
