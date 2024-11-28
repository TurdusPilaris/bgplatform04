import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserOutputModel } from '../api/models/output/user.output.model';
import { QueryUserInputModel } from '../api/models/input/query-user.input.model';
import { PaginationOutputModel } from '../../../../base/models/output/pagination.output.model';
import { AboutMeOutputModel } from '../../auth/api/models/output/about-me-output-model';
import { UserSQL } from '../api/models/sql/user.model.sql';
import { UserTor } from '../domain/entities/user.sql.entity';
import { uuid } from 'uuidv4';

@Injectable()
export class UsersTorQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(UserTor)
    private readonly usersRepository: Repository<UserTor>,
  ) {}

  async findById(id: string): Promise<UserOutputModel | null> {
    const foundUser = await this.usersRepository.findOneBy({ id: id });

    if (!foundUser) return null;

    return this.userOutputModelMapper(foundUser);
  }

  async findAll(
    queryDto: QueryUserInputModel,
  ): Promise<PaginationOutputModel<UserOutputModel[]>> {
    const query = `
    SELECT id, "userName" as login, email, "createdAt"
        FROM public."Users" 
        WHERE "userName" ILIKE $3 OR email ILIKE $4
        ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
        LIMIT $1 OFFSET $2
    `;

    const searchLoginTerm = queryDto.searchLoginTerm
      ? `%${queryDto.searchLoginTerm}%`
      : '';
    const searchEmailTerm = queryDto.searchEmailTerm
      ? `%${queryDto.searchEmailTerm}%`
      : '';

    const res = await this.dataSource.query(query, [
      queryDto.pageSize,
      (queryDto.pageNumber - 1) * queryDto.pageSize,
      searchLoginTerm,
      searchEmailTerm,
    ]);

    const countUsers = await this.getCountUsersByFilter(
      searchLoginTerm,
      searchEmailTerm,
    );

    return this.paginationUserOutputModelMapper(queryDto, countUsers, res);
  }

  async getCountUsersByFilter(
    searchLoginTerm: string,
    searchEmailTerm: string,
  ) {
    const query = `
    SELECT  count(*) as "countOfUsers"
	      FROM public."Users" u
	      WHERE "userName" ILIKE $1 OR email ILIKE $2
    `;

    const res = await this.dataSource.query(query, [
      searchLoginTerm,
      searchEmailTerm,
    ]);

    return +res[0].countOfUsers;
  }

  paginationUserOutputModelMapper = (
    query: QueryUserInputModel,
    countUsers: number,
    items: UserOutputModel[],
  ): PaginationOutputModel<UserOutputModel[]> => {
    return {
      pagesCount: Math.ceil(countUsers / query.pageSize),
      page: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount: countUsers,
      items: items,
    };
  };

  async delete(id: string) {
    const query = `
    DELETE FROM public."Users"
        WHERE id = $1;
    `;

    await this.dataSource.query(query, [id]);
  }

  async getAboutMe(userId: string): Promise<AboutMeOutputModel | null> {
    const user = await this.findById(userId);

    if (!user) return null;
    return this.aboutMeOutputModelMapper(user);
  }
  aboutMeOutputModelMapper = (user: UserOutputModel): AboutMeOutputModel => {
    return {
      login: user.login,
      email: user.email,
      userId: user.id,
    };
  };

  userOutputModelMapper = (user: UserTor): UserOutputModel => {
    return {
      id: user.id,
      login: user.userName,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  };
}
