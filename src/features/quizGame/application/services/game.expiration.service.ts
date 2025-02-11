import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FinishExpiredGamesCommand } from '../use-cases/game/finish-expired-games-use-case';

@Injectable()
export class GameExpirationService {
  constructor(private readonly commandBus: CommandBus) {}

  @Cron('*/1 * * * * *') // Запуск каждые 10 секунд
  async handleExpiredGames() {
    await this.commandBus.execute(new FinishExpiredGamesCommand());
  }
}
