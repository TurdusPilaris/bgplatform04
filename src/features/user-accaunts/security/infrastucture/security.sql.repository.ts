import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SecuritySqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createSession(payload: any, deviceName: string, ip: string) {
    const query = `
    INSERT INTO public."DeviceAuthSession"(
        "userId", "deviceId", iat, "deviceName", ip, exp)
        VALUES ( $1, $2, $3, $4, $5, $6) RETURNING id;
    `;

    const res = await this.dataSource.query(query, [
      payload.userId,
      payload.deviceId,
      new Date(payload.iat * 1000),
      deviceName,
      ip,
      new Date(payload.exp * 1000),
    ]);

    return res[0].id;
  }

  async getSession(userId: string, deviceId: string, iat: Date) {
    const query = `
    SELECT "userId", "deviceId", iat, "deviceName", ip, exp, id
        FROM public."DeviceAuthSession"
        WHERE "userId" = $1 AND "deviceId" = $2 AND iat = $3; 
    `;

    const res = await this.dataSource.query(query, [userId, deviceId, iat]);

    if (res.length === 0) return null;

    return res.map((e) => {
      return {
        ...e,
      };
    })[0];
  }

  async updateSession(id: string, iat: Date, exp: Date) {
    const query = `
    UPDATE public."DeviceAuthSession"
        SET iat = $2, exp = $3
        WHERE id = $1;
    `;

    await this.dataSource.query(query, [id, iat, exp]);
  }

  async deleteCurrentSessions(userId: string, currentDeviceId: string) {
    const query = `
    DELETE FROM public."DeviceAuthSession"
        WHERE "userId" = $1 AND "deviceId" = $2;
    `;

    await this.dataSource.query(query, [userId, currentDeviceId]);
  }

  async deleteSessionByDeviceID(id: string) {
    const query = `
    DELETE FROM public."DeviceAuthSession"
        WHERE id = $1;
    `;

    await this.dataSource.query(query, [id]);
  }

  async deleteNonCurrentSessions(userId: string, currentDeviceId: string) {
    const query = `
    DELETE FROM public."DeviceAuthSession"
        WHERE "userId" = $1 AND "deviceId" <> $2;
    `;

    await this.dataSource.query(query, [userId, currentDeviceId]);
  }
  async getSessionByDeviceID(deviceId: string) {
    const query = `
    SELECT "userId", "deviceId", iat, "deviceName", ip, exp, id
        FROM public."DeviceAuthSession"
        WHERE "deviceId" = $1 ; 
    `;

    const res = await this.dataSource.query(query, [deviceId]);

    if (res.length === 0) return null;

    return res.map((e) => {
      return {
        ...e,
      };
    })[0];
  }
}
