import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { BlogCreateInputModel } from '../../../src/features/bloggers-platform/blogs/api/models/input/create-blog.input.model';
import { CreatePostWithoutBlogIdInputModel } from '../../../src/features/bloggers-platform/posts/api/models/input/create-post-withoutBlogId.input.model';

export class BlogsSaTestManager {
  readonly pathSa: string = '/sa/blogs';
  readonly path: string = '/sa/blogs';
  constructor(protected readonly app: INestApplication) {}

  async createBlogBadRequest(
    CORRECT_ADMIN_AUTH_BASE64: string,
    createModel: BlogCreateInputModel,
  ) {
    return request(this.app.getHttpServer())
      .post(this.pathSa)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .send(createModel)
      .expect(400);
  }

  async createBlog(
    CORRECT_ADMIN_AUTH_BASE64: string,
    createModel: BlogCreateInputModel,
  ) {
    return request(this.app.getHttpServer())
      .post(this.pathSa)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .send(createModel)
      .expect(201);
  }

  async createBlogUnauthorized(
    UNCORRECT_ADMIN_AUTH_BASE64: string,
    createModel: BlogCreateInputModel,
  ) {
    return request(this.app.getHttpServer())
      .post(this.pathSa)
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
      .put(`${this.pathSa + '/' + blogId}`)
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
      .put(`${this.pathSa + '/' + blogId}`)
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
      .put(`${this.pathSa + '/' + blogId}`)
      .set({ authorization: UNCORRECT_ADMIN_AUTH_BASE64 })
      .send(createModel)
      .expect(401);
  }

  async deleteBlog(CORRECT_ADMIN_AUTH_BASE64: string, blogId: string) {
    return request(this.app.getHttpServer())
      .delete(`${this.pathSa + '/' + blogId}`)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .expect(204);
  }

  async deleteBlogNotFound(CORRECT_ADMIN_AUTH_BASE64: string, blogId: string) {
    return request(this.app.getHttpServer())
      .delete(`${this.pathSa + '/' + blogId}`)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .expect(404);
  }

  async deleteBlogUnauthorized(
    UNCORRECT_ADMIN_AUTH_BASE64: string,
    blogId: string,
  ) {
    return request(this.app.getHttpServer())
      .delete(`${this.pathSa + '/' + blogId}`)
      .set({ authorization: UNCORRECT_ADMIN_AUTH_BASE64 })
      .expect(401);
  }

  async createPostByBlogId(
    CORRECT_ADMIN_AUTH_BASE64: string,
    createModel: CreatePostWithoutBlogIdInputModel,
    blogId: string,
  ) {
    return request(this.app.getHttpServer())
      .post(`${this.pathSa + '/' + blogId + '/posts'}`)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .send(createModel)
      .expect(201);
  }

  async createPostByBlogIdNotFound(
    CORRECT_ADMIN_AUTH_BASE64: string,
    createModel: CreatePostWithoutBlogIdInputModel,
    blogId: string,
  ) {
    return request(this.app.getHttpServer())
      .post(`${this.pathSa + '/' + blogId + '/posts'}`)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .send(createModel)
      .expect(404);
  }

  async createPostByBlogIdUnauthorized(
    UNCORRECT_ADMIN_AUTH_BASE64: string,
    createModel: CreatePostWithoutBlogIdInputModel,
    blogId: string,
  ) {
    return request(this.app.getHttpServer())
      .post(`${this.pathSa + '/' + blogId + '/posts'}`)
      .set({ authorization: UNCORRECT_ADMIN_AUTH_BASE64 })
      .send(createModel)
      .expect(401);
  }

  async createPostByBlogIdBadRequest(
    CORRECT_ADMIN_AUTH_BASE64: string,
    createModel: CreatePostWithoutBlogIdInputModel,
    blogId: string,
  ) {
    return request(this.app.getHttpServer())
      .post(`${this.pathSa + '/' + blogId + '/posts'}`)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .send(createModel)
      .expect(400);
  }

  async getBlogs(CORRECT_ADMIN_AUTH_BASE64: string, queryString: string) {
    return request(this.app.getHttpServer())
      .get(this.pathSa + queryString)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .expect(200);
  }

  async getBlogsNotSa(queryString: string) {
    return request(this.app.getHttpServer())
      .get(this.pathSa + queryString)
      .expect(200);
  }

  async getBlogsUnauthorize(
    UNCORRECT_ADMIN_AUTH_BASE64: string,
    queryString: string,
  ) {
    return request(this.app.getHttpServer())
      .get(this.pathSa + queryString)
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

  expectCorrectModelForPost(
    createModel: CreatePostWithoutBlogIdInputModel,
    blogId: string,
    responseModel: any,
  ) {
    expect(createModel.content).toBe(responseModel.content);
    expect(createModel.shortDescription).toBe(responseModel.shortDescription);
    expect(createModel.title).toBe(responseModel.title);
    expect(blogId).toBe(responseModel.blogId);
  }
}
