import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UserCreateModel } from '../../../src/features/user-accaunts/users/api/models/input/create-user.input.model';
import { QuestionInputModel } from '../../../src/features/quizGame/api/models/input/question/question.input.model';
import { QuestionPublishInputModel } from '../../../src/features/quizGame/api/models/input/question/question.publish.input.model';

export class QuestionsTestManager {
  readonly pathSa: string = '/sa/quiz/questions';

  constructor(protected readonly app: INestApplication) {}

  // можно выносить некоторые проверки в отдельные методы для лучшей читаемости тестов

  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.body).toBe(responseModel.body);
    expect(createModel.correctAnswers).toEqual(responseModel.correctAnswers);
    expect(createModel.published).toBeFalsy();
    expect(createModel.id).toBeDefined();
    expect(createModel.createdAt).toBeDefined();
    expect(typeof createModel.createdAt).toBe('string');
    expect(createModel.updatedAt).toBeDefined();
    expect(typeof createModel.updatedAt).toBe('string');
  }
  async createQuestionsForGet(
    CORRECT_ADMIN_AUTH_BASE64: string,
    arrayQuestions: QuestionInputModel[],
  ) {
    for (let i = 0; i < arrayQuestions.length; i++) {
      if (i === arrayQuestions.length - 1) {
        return request(this.app.getHttpServer())
          .post(this.pathSa)
          .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
          .send(arrayQuestions[i])
          .expect(201);
      }
      await request(this.app.getHttpServer())
        .post(this.pathSa)
        .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
        .send(arrayQuestions[i])
        .expect(201);
    }
  }
  async getAllQuestions(
    CORRECT_ADMIN_AUTH_BASE64: string,
    queryString: string = ``,
  ) {
    return request(this.app.getHttpServer())
      .get(this.pathSa + queryString)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .expect(200);
  }

  async updatePublishQuestion(
    CORRECT_ADMIN_AUTH_BASE64: string,
    updateModel: QuestionPublishInputModel,
    questionId: string,
  ) {
    console.log(
      'string------',
      `${this.pathSa + '/' + questionId + '/publish'}`,
    );
    return request(this.app.getHttpServer())
      .put(`${this.pathSa + '/' + questionId + '/publish'}`)
      .set({ authorization: CORRECT_ADMIN_AUTH_BASE64 })
      .send(updateModel)
      .expect(204);
  }

  async getAllQuestionsUnauthorized(UNCORRECT_ADMIN_AUTH_BASE64: string) {
    request(this.app.getHttpServer())
      .get(this.pathSa)
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
