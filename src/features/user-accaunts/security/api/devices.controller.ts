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
import { SecurityTorRepository } from '../infrastucture/security.tor.repository';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteSessionCommand } from '../application/use-cases/delete-session-use-case';
import { DeleteSessionByDeviceIdCommand } from '../application/use-cases/delete-session-by-device-id-use-case';

@UseGuards(AuthRefreshTokenGuard)
@Controller('security')
export class DevicesController {
  constructor(
    private commandBus: CommandBus,
    protected securitySqlRepository: SecuritySqlRepository,
    protected securityTorRepository: SecurityTorRepository,
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
    await this.commandBus.execute(
      new DeleteSessionCommand(req.userId, req.deviceId),
    );
  }

  @HttpCode(204)
  @Delete('devices/:id')
  async deleteDevicesByID(@Param('id') deviceId: string, @Req() req: Request) {
    const result = await this.commandBus.execute(
      new DeleteSessionByDeviceIdCommand(req.userId, deviceId),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
  }
}
