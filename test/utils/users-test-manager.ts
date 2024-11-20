import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UserCreateModel } from '../../src/features/user-accaunts/users/api/models/input/create-user.input.model';

export class UsersTestManager {
  readonly path: string = '/sa/users';
  constructor(protected readonly app: INestApplication) {}

  // можно выносить некоторые проверки в отдельные методы для лучшей читаемости тестов
  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.login).toBe(responseModel.login);
    expect(createModel.email).toBe(responseModel.email);
  }

  // async createUser(adminAccessToken: string, createModel: UserCreateModel) {
  //   return request(this.app.getHttpServer())
  //     .post('/api/users')
  //     .auth(adminAccessToken, {
  //       type: 'bearer',
  //     })
  //     .send(createModel)
  //     .expect(200);
  // }

  async createUser(
    CORRECT_ADMIN_AUTH_BASE64: string,
    createModel: UserCreateModel,
  ) {
    return request(this.app.getHttpServer())
      .post(this.path)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .send(createModel)
      .expect(201);
  }

  async createUserBadRequset(
    CORRECT_ADMIN_AUTH_BASE64: string,
    createModel: UserCreateModel,
  ) {
    return request(this.app.getHttpServer())
      .post(this.path)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .send(createModel)
      .expect(400);
  }
  async updateUser(adminAccessToken: string, updateModel: any) {
    return request(this.app.getHttpServer())
      .put(this.path)
      .auth(adminAccessToken, {
        type: 'bearer',
      })
      .send(updateModel)
      .expect(204);
  }

  // async login(
  //   login: string,
  //   password: string,
  // ): Promise<{ accessToken: string; refreshToken: string }> {
  //   const response = await request(this.app.getHttpServer())
  //     .post('/login')
  //     .send({ login, password })
  //     .expect(200);
  //
  //   return {
  //     accessToken: response.body.accessToken,
  //     refreshToken: response.headers['set-cookie'][0]
  //       .split('=')[1]
  //       .split(';')[0],
  //   };
  // }
}
