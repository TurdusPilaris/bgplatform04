import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { LoginInputModel } from '../../../src/features/user-accaunts/auth/api/models/input/login.input.model';
import { UserCreateModel } from '../../../src/features/user-accaunts/users/api/models/input/create-user.input.model';
import { EmailInputModel } from '../../../src/features/user-accaunts/auth/api/models/input/email.input.model';

export class AuthTestManager {
  readonly path: string = '/auth';
  constructor(protected readonly app: INestApplication) {}

  async login(loginInput: LoginInputModel) {
    return request(this.app.getHttpServer())
      .post(this.path + '/login')
      .send(loginInput)
      .expect(200);
  }
  async loginWithoutUser(loginInput: LoginInputModel) {
    return request(this.app.getHttpServer())
      .post(this.path + '/login')
      .send(loginInput)
      .expect(401);
  }

  async registration(createInputUser: UserCreateModel) {
    return request(this.app.getHttpServer())
      .post(this.path + '/registration')
      .send(createInputUser)
      .expect(204);
  }
  async registrationBadRequest(createInputUser: UserCreateModel) {
    return request(this.app.getHttpServer())
      .post(this.path + '/registration')
      .send(createInputUser)
      .expect(400);
  }
  async passwordRecovery(inputEmail: EmailInputModel) {
    return request(this.app.getHttpServer())
      .post(this.path + '/password-recovery')
      .send(inputEmail)
      .expect(204);
  }
  async passwordRecoveryBad(inputEmail: EmailInputModel) {
    return request(this.app.getHttpServer())
      .post(this.path + '/password-recovery')
      .send(inputEmail)
      .expect(400);
  }
}
