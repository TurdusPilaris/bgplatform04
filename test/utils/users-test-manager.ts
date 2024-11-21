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

  async deleteUser(CORRECT_ADMIN_AUTH_BASE64: string, userId: string) {
    return request(this.app.getHttpServer())
      .delete(`${this.path + '/' + userId}`)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .expect(204);
  }

  async deleteUserBadUserId(CORRECT_ADMIN_AUTH_BASE64: string, userId: string) {
    return request(this.app.getHttpServer())
      .delete(`${this.path + '/' + userId}`)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .expect(404);
  }
  async deleteUserUnauthorized(
    UNCORRECT_ADMIN_AUTH_BASE64: string,
    userId: string,
  ) {
    return request(this.app.getHttpServer())
      .delete(`${this.path + '/' + userId}`)
      .set({ authorization: UNCORRECT_ADMIN_AUTH_BASE64 })
      .expect(401);
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

  async createUsersForGet(
    CORRECT_ADMIN_AUTH_BASE64: string,
    arrayUsers: UserCreateModel[],
  ) {
    // arrayUsers.forEach((user) => {
    for (let i = 0; i < arrayUsers.length; i++) {
      await request(this.app.getHttpServer())
        .post(this.path)
        .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
        .send(arrayUsers[i])
        .expect(201);
    }
    // });
  }

  async getAllUsers(
    CORRECT_ADMIN_AUTH_BASE64: string,
    queryString: string = ``,
  ) {
    return request(this.app.getHttpServer())
      .get(this.path + queryString)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .expect(200);
  }

  async getAllUsersUnauthorized(UNCORRECT_ADMIN_AUTH_BASE64: string) {
    request(this.app.getHttpServer())
      .get(this.path)
      .set({ authorization: UNCORRECT_ADMIN_AUTH_BASE64 })
      .expect(200);
  }
  expectPaginator(
    requestBody: any,
    countItems: number,
    pageSize: number = 10,
    pageNumber: number = 1,
  ) {
    const amountPages = Math.ceil(countItems / pageSize);
    const amountItems =
      pageNumber < amountPages
        ? pageSize
        : countItems - pageSize * (pageNumber - 1);
    expect(requestBody.totalCount).toBe(countItems);
    expect(requestBody.pageSize).toBe(pageSize);
    expect(requestBody.page).toBe(pageNumber);
    expect(requestBody.pagesCount).toBe(amountPages);
    expect(requestBody.items.length).toBe(amountItems);
  }
}
