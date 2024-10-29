import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SecurityQueryRepository } from '../infrastucture/security.query.repository';
import { SecurityRepository } from '../infrastucture/security.repository';
import { SecurityService } from '../application/security.service';
import { AuthRefreshTokenGuard } from '../../../../infrastructure/guards/auth.refresh-token-guard';
import { ErrorProcessor } from '../../../../base/models/errorProcessor';

@UseGuards(AuthRefreshTokenGuard)
@Controller('security')
export class DevicesController {
  constructor(
    protected securityQueryRepository: SecurityQueryRepository,
    protected securityRepository: SecurityRepository,
    protected securityService: SecurityService,
  ) {}

  @Get('devices')
  async getDevices(@Req() req: any) {
    return await this.securityQueryRepository.getAllSessionsForUser(req.userId);
  }

  @HttpCode(204)
  @Delete('devices')
  async deleteDevices(@Req() req: any) {
    await this.securityRepository.deleteNonCurrentSessions(
      req.userId,
      req.deviceId,
    );
  }

  @HttpCode(204)
  @Delete('devices/:id')
  async deleteDevicesByID(@Param('id') deviceId: string, @Req() req: any) {
    const result = await this.securityService.deleteSessionByDeviceID(
      req.userId,
      deviceId,
    );

    if (result.hasError()) {
      new ErrorProcessor(result.code, result.extensions).errorHandling();
    }
  }
}
