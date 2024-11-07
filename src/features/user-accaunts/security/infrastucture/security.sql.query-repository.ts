import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserOutputModel } from '../../users/api/models/output/user.output.model';
import { DeviceAuthSessionDocument } from '../domain/deviceAuthSession.entity';
import { DeviceOutputModel } from '../api/models/output/device.output.model';
import { DeviceAuthSessionSQL } from '../api/models/sql/device.model.sql';

@Injectable()
export class SecuritySqlQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getAllSessionsForUser(userId: string) {
    const query = `
    SELECT "userId", "deviceId", iat, "deviceName" as title, ip, exp, id
        FROM public."DeviceAuthSession"
        WHERE "userId" = $1;
    `;

    const res = await this.dataSource.query(query, [userId]);

    if (res.length === 0) return null;

    return res.map((e) => {
      return {
        ip: e.ip,
        title: e.title,
        lastActiveDate: e.iat.toISOString(),
        deviceId: e.deviceId,
      };
    });
  }
}
