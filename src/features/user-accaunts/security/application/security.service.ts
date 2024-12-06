import { Injectable } from '@nestjs/common';
import { SecurityTorRepository } from '../infrastucture/tor/security.tor.repository';

@Injectable()
export class SecurityService {
  constructor(protected securityTorRepository: SecurityTorRepository) {}

  async updateSession(id: string, iat: Date, exp: Date) {
    await this.securityTorRepository.updateSession(id, iat, exp);
  }
}
