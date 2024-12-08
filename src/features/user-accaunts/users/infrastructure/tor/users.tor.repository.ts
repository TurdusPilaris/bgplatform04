import { InjectRepository } from '@nestjs/typeorm';
import { UserSQL } from '../../domain/entities/user.sql.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

export interface IUsersRepository {}
@Injectable()
export class UsersTorRepository implements IUsersRepository {
  constructor(
    @InjectRepository(UserSQL)
    private readonly usersRepository: Repository<UserSQL>,
  ) {}

  async createUser(user: UserSQL): Promise<string> {
    const createdUser = await this.usersRepository.save(user);
    return createdUser.id;
  }

  async delete(id: string) {
    await this.usersRepository.delete(id);
  }

  async findById(id: string): Promise<UserSQL | null> {
    return this.usersRepository.findOneBy({ id: id });
  }

  async findByCodeConfirmation(code: string): Promise<UserSQL | null> {
    return this.usersRepository.findOneBy({ confirmationCode: code });
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserSQL | null> {
    return this.usersRepository.findOne({
      where: [
        { userName: loginOrEmail }, // Поиск по userName
        { email: loginOrEmail }, // Поиск по email
      ],
    });
  }

  async updateConfirmation(id: string) {
    await this.usersRepository.update(
      { id: id },
      {
        isConfirmed: true,
      },
    );
  }

  async updateConfirmationAndPassword(id: string, newPasswordHash: string) {
    await this.usersRepository.update(
      { id: id },
      {
        isConfirmed: true,
        passwordHash: newPasswordHash,
      },
    );
  }

  async updateConfirmationCode(
    id: string,
    confirmationCode: string,
    expirationDate: Date,
  ) {
    await this.usersRepository.update(
      { id: id },
      {
        isConfirmed: false,
        confirmationCode: confirmationCode,
        expirationDate: expirationDate,
      },
    );
  }
}
