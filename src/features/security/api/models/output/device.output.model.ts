import { DeviceAuthSessionDocument } from '../../../domain/deviceAuthSession.entity';

export class DeviceOutputModel {
  constructor() {}

  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}

export const DeviceOutputModelMapper = (
  device: DeviceAuthSessionDocument,
): DeviceOutputModel => {
  const outputDeviceModel = new DeviceOutputModel();
  outputDeviceModel.ip = device.ip;
  outputDeviceModel.title = device.deviceName;
  outputDeviceModel.lastActiveDate = device.iat.toISOString();
  outputDeviceModel.deviceId = device.deviceId;

  return outputDeviceModel;
};
