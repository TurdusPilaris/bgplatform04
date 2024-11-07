import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserCreateSqlModel } from '../api/models/sql/create-user.sql.model';
import { UserOutputModel } from '../api/models/output/user.output.model';
import { QueryUserInputModel } from '../api/models/input/query-user.input.model';
import { PaginationOutputModel } from '../../../../base/models/output/pagination.output.model';

@Injectable()
export class UsersSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createUser(createModel: UserCreateSqlModel) {
    const query = `
    INSERT INTO public."Users"(
        "userName", email, "passwordHash", "createdAt", "confirmationCode", "expirationDate", "isConfirmed")
        VALUES ( $1, $2, $3, $4, $5, $6, $7) RETURNING id;
    `;

    const res = await this.dataSource.query(query, [
      createModel.userName,
      createModel.email,
      createModel.passwordHash,
      createModel.createdAt,
      createModel.confirmationCode,
      createModel.expirationDate,
      createModel.isConfirmed,
    ]);

    const createdUser: UserOutputModel | null = await this.findById(res[0].id);

    return createdUser;
  }

  async findById(id: string): Promise<UserOutputModel | null> {
    const query = `
    SELECT id, "userName" as login, email, "createdAt"
        FROM public."Users"
        WHERE id = $1;
    `;

    const res = await this.dataSource.query(query, [id]);

    if (res.length === 0) return null;

    return res.map((e) => {
      return {
        ...e,
      };
    })[0];
  }

  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserOutputModel | null> {
    const query = `
    SELECT id, "userName" as login, email, "createdAt"
        FROM public."Users"
        WHERE "userName" = $1 OR email = $1;
    `;

    const res = await this.dataSource.query(query, [loginOrEmail]);

    if (res.length === 0) return null;

    return res.map((e) => {
      return {
        ...e,
      };
    })[0];
  }

  async findAll(
    queryDto: QueryUserInputModel,
  ): Promise<PaginationOutputModel<UserOutputModel[]>> {
    const query = `
    SELECT u.id, u."userName" as login, u.email, "createdAt"
        FROM public."Users" u
        WHERE "userName" ILIKE $3 AND email ILIKE $4
        ORDER BY ${queryDto.sortBy} ${queryDto.sortDirection}
        LIMIT $1 OFFSET $2
    `;

    const res = await this.dataSource.query(query, [
      queryDto.pageSize,
      queryDto.pageNumber - 1,
      `%${queryDto.searchLoginTerm}%`,
      `%${queryDto.searchEmailTerm}%`,
    ]);

    const countUsers = await this.getCountUsersByFilter(
      queryDto.searchLoginTerm,
      queryDto.searchEmailTerm,
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
	      WHERE "userName" ILIKE $1 AND email ILIKE $2
    `;

    const res = await this.dataSource.query(query, [
      `%${searchLoginTerm}%`,
      `%${searchEmailTerm}%`,
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
}
