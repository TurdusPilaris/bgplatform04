import { Injectable } from '@nestjs/common';
import { InterlayerNotice } from '../../../../base/models/Interlayer';
import { SecuritySqlRepository } from '../infrastucture/security.sql.repository';

@Injectable()
export class SecurityService {
  constructor(protected securitySqlRepository: SecuritySqlRepository) {}

  async updateSession(id: string, iat: Date, exp: Date) {
    await this.securitySqlRepository.updateSession(id, iat, exp);
  }

  async dropCurrentSession(userId: string, currentDeviceId: string) {
    await this.securitySqlRepository.deleteCurrentSessions(
      userId,
      currentDeviceId,
    );
  }

  async deleteSessionByDeviceID(userId: string, deviceId: string) {
    const session =
      await this.securitySqlRepository.getSessionByDeviceID(deviceId);

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

    await this.securitySqlRepository.deleteSessionByDeviceID(session.id);

    return new InterlayerNotice();
  }
}
