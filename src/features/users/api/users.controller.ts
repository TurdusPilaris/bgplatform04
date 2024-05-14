import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { UserCreateModel } from './models/input/create-user.input.model';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/entities/user.entity';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { QueryUserInputModel } from './models/input/query-user.input.model';
import express, { Request, Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,

    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}
  // constructor(protected usersService: UsersService) {}
  // @Get()
  // getUsers(@Query() query: { term: string }) {
  //   // return this.usersService.findUsers(query.term);
  // }
  //
  // @Get(':id')
  // getUser(@Param('id') userId: string) {
  //   return [{ id: 1 }, { id: 2 }].find((u) => u.id === +userId);
  // }

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
  async createUsers(@Body() inputModel: UserCreateModel) {
    return await this.usersService.create(inputModel);
  }

  @Delete(':id')
  async deleteUser(@Param('id') userId: string, @Res() response: Response) {
    const result = await this.usersService.delete(userId);

    if (result.hasError()) {
      if (result.code === 404) {
        return response.status(result.code).send();
      }
      if (result.code === 502) {
        return response.status(result.code).send();
      }
    } else {
      return response.status(204).send();
    }
  }
  //
  // @Put(':id')
  // updateUser(
  //   @Param('id') userId: string,
  //   @Body() inputModel: CreateUserInputModelType,
  // ) {
  //   return { id: userId, model: inputModel };
  // }
}
