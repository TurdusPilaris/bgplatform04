import { Injectable } from '@nestjs/common';
import {
  DeviceAuthSession,
  DeviceAuthSessionModelType,
} from '../domain/deviceAuthSession.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceOutputModelMapper } from '../api/models/output/device.output.model';

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

    return sessions.map((device) => DeviceOutputModelMapper(device));
  }
}
