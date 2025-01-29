import { Injectable } from '@nestjs/common';
import { Question } from '../domain/entities/question.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQuestionInputModel } from '../api/models/input/question/pagination.question.input.model';
import { QuestionViewModel } from '../api/models/output/question/question.view.model';
import { paginationModelMapper } from '../../../base/models/output/pagination.output.model';
import { PublishedStatus } from '../../../base/models/publishedStatus';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  async getAll(queryDto: PaginationQuestionInputModel) {
    //params
    const limit = queryDto.pageSize;
    const offset = (queryDto.pageNumber - 1) * queryDto.pageSize;
    const bodySearchTerm = queryDto.bodySearchTerm
      ? `%${queryDto.bodySearchTerm}%`
      : '%%';
    const sortDirection = (
      queryDto.sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
    ) as 'ASC' | 'DESC'; // Приведение к литеральному типу

    const publishedStatus = queryDto.publishedStatus;

    const queryBuilder = this.questionsRepository
      .createQueryBuilder('q')
      .where('q.body ILIKE :body ', { body: bodySearchTerm });
    if (publishedStatus === PublishedStatus.Published) {
      queryBuilder.andWhere('q.published = TRUE');
    } else if (publishedStatus === PublishedStatus.NotPublished) {
      queryBuilder.andWhere('q.published = FALSE');
    }
    const [items, count] = await queryBuilder
      .orderBy(`"${queryDto.sortBy}"`, sortDirection)
      .offset(offset)
      .limit(limit)
      .getManyAndCount();

    const res = items.map(this.questionOutputMapper);
    return paginationModelMapper(queryDto, count, res);
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
      updatedAt:
        question.createdAt.toISOString() === question.updatedAt.toISOString()
          ? null
          : question.updatedAt.toISOString(),
    };
  };
}
