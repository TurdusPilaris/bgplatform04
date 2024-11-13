import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserCreateSqlModel } from '../api/models/sql/create-user.sql.model';
import { UserSQL } from '../api/models/sql/user.model.sql';

@Injectable()
export class UsersSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createUser(createModel: UserCreateSqlModel): Promise<string> {
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

    return res[0].id;
  }

  async findById(id: string): Promise<UserSQL | null> {
    const query = `
    SELECT id, "userName", email, "createdAt", "confirmationCode", "expirationDate", "isConfirmed", "passwordHash"
        FROM public."Users"
        WHERE id = $1;
    `;

    const res = await this.dataSource.query(query, [id]);

    if (res.length === 0) return null;

    const users: UserSQL[] = res.map((e) => {
      return new UserSQL(
        e.id,
        e.userName,
        e.email,
        e.passwordHash,
        e.createdAt,
        e.confirmationCode,
        e.expirationDate,
        e.isConfirmed,
      );
    });

    return users[0];
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserSQL | null> {
    const query = `
    SELECT id, "userName" , email, "passwordHash", "createdAt", "confirmationCode", "expirationDate", "isConfirmed"
        FROM public."Users"
        WHERE "userName" = $1 OR email = $1;
    `;

    const res = await this.dataSource.query(query, [loginOrEmail]);

    if (res.length === 0) return null;

    const users: UserSQL[] = res.map((e) => {
      return new UserSQL(
        e.id,
        e.userName,
        e.email,
        e.passwordHash,
        e.createdAt,
        e.confirmationCode,
        e.expirationDate,
        e.isConfirmed,
      );
    });

    return users[0];
  }

  async delete(id: string) {
    const query = `
    DELETE FROM public."Users"
        WHERE id = $1;
    `;

    await this.dataSource.query(query, [id]);
  }

  async updateConfirmationCode(
    id: string,
    confirmationCode: string,
    expirationDate: Date,
  ) {
    const query = `
    UPDATE public."Users"
        SET "confirmationCode"=$2, "expirationDate"=$3, "isConfirmed"=false
        WHERE id = $1;
    `;

    await this.dataSource.query(query, [id, confirmationCode, expirationDate]);
  }

  async findByCodeConfirmation(code: string) {
    const query = `
    SELECT id, "userName" as login, email, "createdAt", "confirmationCode", "expirationDate", "isConfirmed"
        FROM public."Users"
        WHERE "confirmationCode" =  $1;
    `;

    const res = await this.dataSource.query(query, [code]);

    if (res.length === 0) return null;

    const users: UserSQL[] = res.map((e) => {
      return new UserSQL(
        e.id,
        e.userName,
        e.email,
        e.passwordHash,
        e.createdAt,
        e.confirmationCode,
        e.expirationDate,
        e.isConfirmed,
      );
    });

    return users[0];
  }

  async updateConfirmation(id: string) {
    const query = `
    UPDATE public."Users"
        SET "isConfirmed"=true
        WHERE id = $1;
    `;

    await this.dataSource.query(query, [id]);
  }
}
