import { Injectable } from '@nestjs/common';
import {
  DeviceAuthSession,
  DeviceAuthSessionDocument,
  DeviceAuthSessionModelType,
} from '../domain/deviceAuthSession.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceOutputModel } from '../api/models/output/device.output.model';

@Injectable()
export class SecurityQueryRepository {
  constructor(
    @InjectModel(DeviceAuthSession.name)
    private DeviceAuthSessionModel: DeviceAuthSessionModelType,
  ) {}

  async getAllSessionsForUser(userId: string) {
    const sessions = await this.DeviceAuthSessionModel.find({
      userId: userId,
    }).exec();

    return sessions.map((device) => this.deviceOutputModelMapper(device));
  }

  deviceOutputModelMapper = (
    device: DeviceAuthSessionDocument,
  ): DeviceOutputModel => {
    return {
      ip: device.ip,
      title: device.deviceName,
      lastActiveDate: device.iat.toISOString(),
      deviceId: device.deviceId,
    };
  };
}
