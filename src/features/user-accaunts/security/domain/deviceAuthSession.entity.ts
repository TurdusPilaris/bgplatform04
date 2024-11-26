import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type DeviceAuthSessionDocument = HydratedDocument<DeviceAuthSession>;

@Schema()
export class DeviceAuthSession {
  @Prop()
  public userId: string;

  @Prop()
  public deviceId: string;

  @Prop()
  public iat: Date;

  @Prop()
  public deviceName: string;

  @Prop()
  public ip: string;

  @Prop()
  public exp: Date;

  static createNewSession(
    SessionModel: DeviceAuthSessionModelType,
    userId: string,
    deviceId: string,
    iat: Date,
    deviceName: string,
    ip: string,
    exp: Date,
  ) {
    return new SessionModel({
      userId: userId,
      deviceId: deviceId,
      iat: iat,
      deviceName: deviceName,
      ip: ip,
      exp: exp,
    });
  }
}

export type DeviceAuthSessionModelStaticType = {
  createNewSession: (
    SessionModel: DeviceAuthSessionModelType,
    userId: string,
    deviceId: string,
    iat: Date,
    deviceName: string,
    ip: string,
    exp: Date,
  ) => DeviceAuthSessionDocument;
};

export const DeviceAuthSessionSchema =
  SchemaFactory.createForClass(DeviceAuthSession);

DeviceAuthSessionSchema.statics = {
  createNewSession: DeviceAuthSession.createNewSession,
} as DeviceAuthSessionModelStaticType;

export type DeviceAuthSessionModelType = Model<DeviceAuthSessionDocument> &
  DeviceAuthSessionModelStaticType;
