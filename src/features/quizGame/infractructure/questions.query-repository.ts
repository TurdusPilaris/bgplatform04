import { Injectable } from '@nestjs/common';
import { Question } from '../domain/entities/question.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQuestionInputModel } from '../api/models/input/question/pagination.question.input.model';
import { QuestionViewModel } from '../api/models/output/question.view.model';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  async getAll(queryDto: PaginationQuestionInputModel) {
    return Promise.resolve(undefined);
  }

  async getById(id: string): Promise<QuestionViewModel | null> {
    const question = await this.questionsRepository.findOneBy({ id: id });
    if (!question) return null;
    return this.questionOutputMapper(question);
  }

  private questionOutputMapper = (question: Question): QuestionViewModel => {
    return {
      id: question.id,
      body: question.body,
      correctAnswers: [...question.answers],
      published: question.published,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
    };
  };
}
