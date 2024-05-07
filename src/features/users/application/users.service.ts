import { UsersRepository } from '../infrastructure/users.repository';
import { UserCreateModel } from '../api/models/input/create-user.input.model';
import { Injectable } from '@nestjs/common';
@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(inputModel: UserCreateModel) {
    return this.usersRepository.createUser(inputModel);
  }
}
