import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { BlogCreateInputModel } from '../../../src/features/bloggers-platform/blogs/api/models/input/create-blog.input.model';

export class BlogsSaTestManager {
  readonly path: string = '/sa/blogs';
  constructor(protected readonly app: INestApplication) {}

  async createBlogBadRequest(
    CORRECT_ADMIN_AUTH_BASE64: string,
    createModel: BlogCreateInputModel,
  ) {
    return request(this.app.getHttpServer())
      .post(this.path)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .send(createModel)
      .expect(400);
  }

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

  async createBlogUnauthorized(
    UNCORRECT_ADMIN_AUTH_BASE64: string,
    createModel: BlogCreateInputModel,
  ) {
    return request(this.app.getHttpServer())
      .post(this.path)
      .set({ authorization: UNCORRECT_ADMIN_AUTH_BASE64 })
      .send(createModel)
      .expect(401);
  }

  async updateBlog(
    CORRECT_ADMIN_AUTH_BASE64: string,
    createModel: BlogCreateInputModel,
    blogId: string,
  ) {
    return request(this.app.getHttpServer())
      .put(`${this.path + '/' + blogId}`)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .send(createModel)
      .expect(204);
  }

  async updateBlogNotFound(
    CORRECT_ADMIN_AUTH_BASE64: string,
    createModel: BlogCreateInputModel,
    blogId: string,
  ) {
    return request(this.app.getHttpServer())
      .put(`${this.path + '/' + blogId}`)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .send(createModel)
      .expect(404);
  }
  async updateBlogUnauthorized(
    UNCORRECT_ADMIN_AUTH_BASE64: string,
    createModel: BlogCreateInputModel,
    blogId: string,
  ) {
    return request(this.app.getHttpServer())
      .put(`${this.path + '/' + blogId}`)
      .set({ authorization: UNCORRECT_ADMIN_AUTH_BASE64 })
      .send(createModel)
      .expect(401);
  }

  async deleteBlog(CORRECT_ADMIN_AUTH_BASE64: string, blogId: string) {
    return request(this.app.getHttpServer())
      .delete(`${this.path + '/' + blogId}`)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .expect(204);
  }

  async deleteBlogNotFound(CORRECT_ADMIN_AUTH_BASE64: string, blogId: string) {
    return request(this.app.getHttpServer())
      .delete(`${this.path + '/' + blogId}`)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .expect(404);
  }

  async deleteBlogUnauthorized(
    UNCORRECT_ADMIN_AUTH_BASE64: string,
    blogId: string,
  ) {
    return request(this.app.getHttpServer())
      .delete(`${this.path + '/' + blogId}`)
      .set({ authorization: UNCORRECT_ADMIN_AUTH_BASE64 })
      .expect(401);
  }
  expectCorrectModel(
    createModel: { websiteUrl: string; name: string; description: string },
    responseModel: any,
  ) {
    expect(createModel.name).toBe(responseModel.name);
    expect(createModel.websiteUrl).toBe(responseModel.websiteUrl);
    expect(createModel.description).toBe(responseModel.description);
  }

  expectCorrectBadRequest(createResponse: any, name: string) {
    expect(createResponse).toHaveProperty('errorsMessages');
    expect(Array.isArray(createResponse.errorsMessages)).toBe(true);

    // Проверяем, что в массиве есть хотя бы одна ошибка с указанным полем
    const error = createResponse.errorsMessages.find(
      (err: any) => err.field === name,
    );
    expect(error).toBeDefined();
    expect(error).toHaveProperty('message');
  }
}
