import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthRefreshTokenGuard } from '../../../../infrastructure/guards/auth.refresh-token-guard';
import { ErrorProcessor } from '../../../../base/models/errorProcessor';
import { Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteSessionCommand } from '../application/use-cases/delete-session-use-case';
import { DeleteSessionByDeviceIdCommand } from '../application/use-cases/delete-session-by-device-id-use-case';
import { SecurityTorQueryRepository } from '../infrastucture/tor/security.tor.query-repository';

@UseGuards(AuthRefreshTokenGuard)
@Controller('security')
export class DevicesController {
  constructor(
    private commandBus: CommandBus,
    protected securityTorQueryRepository: SecurityTorQueryRepository,
  ) {}

  @Get('devices')
  async getDevices(@Req() req: Request) {
    return await this.securityTorQueryRepository.getAllSessionsForUser(
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
