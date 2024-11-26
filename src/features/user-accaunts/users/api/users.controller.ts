import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserCreateModel } from './models/input/create-user.input.model';
import { UsersService } from '../application/users.service';
import { AuthBasicGuard } from '../../../../infrastructure/guards/auth.basic.guard';
import { ErrorProcessor } from '../../../../base/models/errorProcessor';
import { QueryUserInputModel } from './models/input/query-user.input.model';
import { UsersSqlQueryRepository } from '../infrastructure/users.sql.query-repositories';

@UseGuards(AuthBasicGuard)
@Controller('sa/users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}

  @Get()
  @HttpCode(200)
  async getUsers(
    @Query()
    queryDto: QueryUserInputModel,
  ) {
    return await this.usersSqlQueryRepository.findAll(queryDto);
  }

  @Post()
  @HttpCode(201)
  async createUsers(@Body() createModel: UserCreateModel) {
    const result = await this.usersService.create(createModel);
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }

    return result.data;
  }

  @HttpCode(204)
  @Delete(':id')
  async deleteUser(@Param('id') userId: string) {
    const result = await this.usersService.delete(userId);

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
  }
}
