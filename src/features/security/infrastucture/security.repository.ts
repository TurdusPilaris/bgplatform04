import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceAuthSession,
  DeviceAuthSessionDocument,
  DeviceAuthSessionModelType,
} from '../domain/deviceAuthSession.entity';
import { Types } from 'mongoose';

@Injectable()
export class SecurityRepository {
  constructor(
    @InjectModel(DeviceAuthSession.name)
    private DeviceAuthSessionModel: DeviceAuthSessionModelType,
  ) {}

  async save(session: DeviceAuthSessionDocument) {
    return await session.save();
  }

  async createSession(payload: any, deviceName: string, ip: string) {
    const session = this.DeviceAuthSessionModel.createNewSession(
      this.DeviceAuthSessionModel,
      payload.userId,
      payload.deviceId,
      new Date(payload.iat * 1000),
      deviceName,
      ip,
      new Date(payload.exp * 1000),
    );

    return await this.save(session);
  }

  async getSession(userId: string, deviceId: string, iat: Date) {
    return this.DeviceAuthSessionModel.findOne({
      userId: userId,
      deviceId: deviceId,
      iat: iat,
    });
  }

  async updateSession(id: string, iat: Date, exp: Date) {
    const updatedSession = await this.DeviceAuthSessionModel.findByIdAndUpdate(
      id,
      {
        $set: {
          iat: iat,
          exp: exp,
        },
      },
    );

    console.log('updatedSession------------------------', updatedSession);
  }

  async deleteCurrentSessions(userId: string, currentDeviceId: string) {
    await this.DeviceAuthSessionModel.deleteMany({
      userId: userId,
      deviceId: currentDeviceId,
    });
  }

  async deleteSessionByDeviceID(id: string) {
    await this.DeviceAuthSessionModel.deleteOne({
      _id: new Types.ObjectId(id),
    });
  }

  async deleteNonCurrentSessions(userId: string, currentDeviceId: string) {
    await this.DeviceAuthSessionModel.deleteMany({
      userId: userId,
      deviceId: { $ne: currentDeviceId },
    });
  }

  async getSessionByDeviceID(deviceId: string) {
    return this.DeviceAuthSessionModel.findOne({ deviceId: deviceId });
  }
}
