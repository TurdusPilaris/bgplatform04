import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SecurityService } from '../application/security.service';
import { AuthRefreshTokenGuard } from '../../../../infrastructure/guards/auth.refresh-token-guard';
import { ErrorProcessor } from '../../../../base/models/errorProcessor';
import { Request } from 'express';
import { SecuritySqlRepository } from '../infrastucture/security.sql.repository';
import { SecuritySqlQueryRepository } from '../infrastucture/security.sql.query-repository';

@UseGuards(AuthRefreshTokenGuard)
@Controller('security')
export class DevicesController {
  constructor(
    protected securitySqlRepository: SecuritySqlRepository,
    protected securitySqlQueryRepository: SecuritySqlQueryRepository,
    protected securityService: SecurityService,
  ) {}

  @Get('devices')
  async getDevices(@Req() req: Request) {
    return await this.securitySqlQueryRepository.getAllSessionsForUser(
      req.userId,
    );
  }

  @HttpCode(204)
  @Delete('devices')
  async deleteDevices(@Req() req: Request) {
    await this.securitySqlRepository.deleteNonCurrentSessions(
      req.userId,
      req.deviceId,
    );
  }

  @HttpCode(204)
  @Delete('devices/:id')
  async deleteDevicesByID(@Param('id') deviceId: string, @Req() req: Request) {
    const result = await this.securityService.deleteSessionByDeviceID(
      req.userId,
      deviceId,
    );

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
  }
}
