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
  ValidationPipe,
} from '@nestjs/common';
import { UserCreateModel } from './models/input/create-user.input.model';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { QueryUserInputModel } from './models/input/query-user.input.model';
import { AuthBasicGuard } from '../../../../infrastructure/guards/auth.basic.guard';
import { ErrorProcessor } from '../../../../base/models/errorProcessor';

@UseGuards(AuthBasicGuard)
@Controller('users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  async getUsers(
    @Query()
    queryDto: QueryUserInputModel,
  ) {
    return await this.usersQueryRepository.findAll(queryDto);
  }

  @Get(':id')
  async getUser(@Param('id') userId: string) {
    return await this.usersQueryRepository.findById(userId);
  }
  @Post()
  @HttpCode(201)
  async createUsers(@Body() createModel: UserCreateModel) {
    const result = await this.usersService.create(createModel);
    if (result.hasError()) {
      new ErrorProcessor(result.code, result.extensions).errorHandling();
    }

    return result.data;
  }

  @HttpCode(204)
  @Delete(':id')
  async deleteUser(@Param('id') userId: string) {
    const result = await this.usersService.delete(userId);

    if (result.hasError()) {
      new ErrorProcessor(result.code, result.extensions).errorHandling();
    }
  }
}
