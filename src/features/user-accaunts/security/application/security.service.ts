import { Injectable } from '@nestjs/common';
import { InterlayerNotice } from '../../../../base/models/Interlayer';
import { SecuritySqlRepository } from '../infrastucture/security.sql.repository';
import { SecurityTorRepository } from '../infrastucture/security.tor.repository';

@Injectable()
export class SecurityService {
  constructor(
    protected securitySqlRepository: SecuritySqlRepository,
    protected securityTorRepository: SecurityTorRepository,
  ) {}

  async updateSession(id: string, iat: Date, exp: Date) {
    await this.securityTorRepository.updateSession(id, iat, exp);
  }

  async dropCurrentSession(userId: string, currentDeviceId: string) {
    await this.securityTorRepository.deleteCurrentSessions(
      userId,
      currentDeviceId,
    );
  }

  async deleteSessionByDeviceID(userId: string, deviceId: string) {
    const session =
      await this.securityTorRepository.getSessionByDeviceID(deviceId);

    if (!session) {
      const result = new InterlayerNotice(null);
      result.addError('Not found ip', 'ip', 404);
      return result;
    }

    if (session.userId !== userId) {
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
