import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { BlogCreateInputModel } from '../../src/features/bloggers-platform/blogs/api/models/input/create-blog.input.model';

export class BlogsSaTestManager {
  readonly path: string = '/sa/blogs';
  constructor(protected readonly app: INestApplication) {}

  async createBlog(
    CORRECT_ADMIN_AUTH_BASE64: string,
    createModel: BlogCreateInputModel,
  ) {
    return request(this.app.getHttpServer())
      .post(this.path)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .send(createModel)
      .expect(201);
  }
}
