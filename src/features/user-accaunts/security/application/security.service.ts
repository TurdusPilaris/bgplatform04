import { Injectable } from '@nestjs/common';
import { SecuritySqlRepository } from '../infrastucture/security.sql.repository';
import { SecurityTorRepository } from '../infrastucture/security.tor.repository';

@Injectable()
export class SecurityService {
  constructor(
    protected securitySqlRepository: SecuritySqlRepository,
    protected securityTorRepository: SecurityTorRepository,
  ) {}

  async updateSession(id: string, iat: Date, exp: Date) {
    await this.securityTorRepository.updateSession(id, iat, exp);
  }

  async dropCurrentSession(userId: string, currentDeviceId: string) {
    await this.securityTorRepository.deleteCurrentSessions(
      userId,
      currentDeviceId,
    );
  }
}
