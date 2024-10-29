import { DeviceAuthSessionDocument } from '../../../domain/deviceAuthSession.entity';

export class DeviceOutputModel {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}

export const deviceOutputModelMapper = (
  device: DeviceAuthSessionDocument,
): DeviceOutputModel => {
  return {
    ip: device.ip,
    title: device.deviceName,
    lastActiveDate: device.iat.toISOString(),
    deviceId: device.deviceId,
  };
};
