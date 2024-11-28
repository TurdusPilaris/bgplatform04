import { InjectRepository } from '@nestjs/typeorm';
import { UserTor } from '../domain/entities/user.sql.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserSQL } from '../api/models/sql/user.model.sql';

@Injectable()
export class UsersTorRepository {
  constructor(
    @InjectRepository(UserTor)
    private readonly usersRepository: Repository<UserTor>,
  ) {}

  async createUser(user: UserTor): Promise<string> {
    const createdUser = await this.usersRepository.save(user);
    return createdUser.id;
  }

  async delete(id: string) {
    await this.usersRepository.delete(id);
  }

  async findById(id: string): Promise<UserTor | null> {
    return this.usersRepository.findOneBy({ id: id });
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserTor | null> {
    return this.usersRepository.findOne({
      where: [
        { userName: loginOrEmail }, // Поиск по userName
        { email: loginOrEmail }, // Поиск по email
      ],
    });
  }
}
