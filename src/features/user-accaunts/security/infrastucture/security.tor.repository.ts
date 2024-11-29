import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { Sessions } from '../domain/session.sql';

@Injectable()
export class SecurityTorRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Sessions)
    private readonly sessionsRepository: Repository<Sessions>,
  ) {}

  // async createSession(payload: any, deviceName: string, ip: string) {
  async createSession(session: Sessions) {
    const createdSession = await this.sessionsRepository.save(session);
    return createdSession.id;
  }

  async getSession(userId: string, deviceId: string, iat: Date) {
    return this.sessionsRepository.findOne({
      where: {
        userId: userId, // Поиск по userId
        deviceId: deviceId, // Поиск по deviceId
        iat: iat, // Поиск по iat
      },
    });
  }

  async updateSession(id: string, iat: Date, exp: Date) {
    await this.sessionsRepository.update({ id: id }, { iat: iat, exp: exp });
  }

  async deleteCurrentSessions(userId: string, currentDeviceId: string) {
    await this.sessionsRepository.delete({
      userId: userId,
      deviceId: currentDeviceId,
    });
  }

  async deleteSessionByDeviceID(id: string) {
    await this.sessionsRepository.delete(id);
  }

  async deleteNonCurrentSessions(userId: string, currentDeviceId: string) {
    await this.sessionsRepository.delete({
      userId: userId,
      deviceId: Not(currentDeviceId),
    });
  }
  async getSessionByDeviceID(deviceId: string) {
    return this.sessionsRepository.findOneBy({ deviceId: deviceId });
  }
}
