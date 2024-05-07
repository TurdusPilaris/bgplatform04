import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserCreateModel } from './models/input/create-user.input.model';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/entities/user.entity';
import { UsersService } from '../application/users.service';
import { UserOutputModelMapper } from './models/output/user.output.model';
// import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    protected usersService: UsersService,

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

  @Post()
  async createUsers(@Body() inputModel: UserCreateModel) {
    const newUser = await this.usersService.create(inputModel);
    return UserOutputModelMapper(newUser);
  }

  // @Delete(':id')
  // deleteUser(@Param('id') userId: string) {
  //   return;
  // }
  //
  // @Put(':id')
  // updateUser(
  //   @Param('id') userId: string,
  //   @Body() inputModel: CreateUserInputModelType,
  // ) {
  //   return { id: userId, model: inputModel };
  // }
}
// type CreateUserInputModelType = {
//   name: string;
//   childrenCount: number;
// };
