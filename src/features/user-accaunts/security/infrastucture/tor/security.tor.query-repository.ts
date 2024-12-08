import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SessionSQL } from '../../domain/session.sql';

@Injectable()
export class SecurityTorQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(SessionSQL)
    private readonly sessionsRepository: Repository<SessionSQL>,
  ) {}

  async getAllSessionsForUser(userId: string) {
    const res = await this.sessionsRepository.find({
      where: {
        userId: userId,
      },
      select: {
        ip: true,
        deviceName: true,
        iat: true,
        deviceId: true,
      },
    });

    if (res.length === 0) return null;

    return res.map((e: SessionSQL) => {
      return {
        ip: e.ip,
        title: e.deviceName,
        lastActiveDate: e.iat.toISOString(),
        deviceId: e.deviceId,
      };
    });
  }
}
