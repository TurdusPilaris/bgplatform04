import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
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
import { AuthBasicGuard } from '../../../infrastructure/guards/auth.basic.guard';
import { AuthService } from '../../auth/application/auth.service';

@UseGuards(AuthBasicGuard)
@Controller('users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected authService: AuthService,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  async getUsers(
    @Query(new ValidationPipe({ transform: true }))
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
      if (result.code === 400) {
        throw new BadRequestException(result.extensions);
      }
    }

    return result.data;
  }

  @HttpCode(204)
  @Delete(':id')
  async deleteUser(@Param('id') userId: string) {
    const result = await this.usersService.delete(userId);

    if (result.hasError()) {
      if (result.code === 404) {
        throw new NotFoundException();
      }
    }
  }
}
