import { Injectable } from '@nestjs/common';
import { InterlayerNotice } from '../../../base/models/Interlayer';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceAuthSession,
  DeviceAuthSessionModelType,
} from '../domain/deviceAuthSession.entity';
import { SecurityRepository } from '../infrastucture/security.repository';

@Injectable()
export class SecurityService {
  constructor(
    @InjectModel(DeviceAuthSession.name)
    private DeviceAuthSessionModel: DeviceAuthSessionModelType,
    protected securityRepository: SecurityRepository,
  ) {}
  async createSession(
    payload: any,
    deviceName: string,
    ip: string | undefined,
  ): Promise<InterlayerNotice<string | null>> {
    if (!ip) {
      const result = new InterlayerNotice(null);
      result.addError('Not found ip', 'ip', 400);
      return result;
    }

    const session = await this.securityRepository.createSession(
      payload,
      deviceName,
      ip,
    );

    console.log('new session then login', session);

    return new InterlayerNotice(session.id);
  }

  async getSession(userId: string, deviceId: string, iat: Date) {
    return this.securityRepository.getSession(userId, deviceId, iat);
  }
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
