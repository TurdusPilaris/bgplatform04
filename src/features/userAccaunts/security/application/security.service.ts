import { Injectable } from '@nestjs/common';
import { SecurityRepository } from '../infrastucture/security.repository';
import { InterlayerNotice } from '../../../../base/models/Interlayer';

@Injectable()
export class SecurityService {
  constructor(protected securityRepository: SecurityRepository) {}

  async updateSession(id: string, iat: Date, exp: Date) {
    await this.securityRepository.updateSession(id, iat, exp);
  }

  async dropCurrentSession(userId: string, currentDeviceId: string) {
    await this.securityRepository.deleteCurrentSessions(
      userId,
      currentDeviceId,
    );
  }

  async deleteSessionByDeviceID(userId: string, deviceId: string) {
    const session =
      await this.securityRepository.getSessionByDeviceID(deviceId);

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

    await this.securityRepository.deleteSessionByDeviceID(session.id);

    return new InterlayerNotice();
  }
}
