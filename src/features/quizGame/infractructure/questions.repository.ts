import { Injectable } from '@nestjs/common';
import { Question } from '../domain/entities/question.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  async createQuestion(question: Question): Promise<Question> {
    return this.questionsRepository.save(question);
  }

  async findById(id: string): Promise<Question> {
    return this.questionsRepository.findOneBy({ id: id });
  }

  async updateQuestion(param: {
    id: string;
    body: string;
    correctAnswers: string[];
  }) {
    await this.questionsRepository.update(
      { id: param.id },
      { body: param.body, answers: param.correctAnswers },
    );
  }

  async updatePublishedQuestion(param: { id: string; published: boolean }) {
    await this.questionsRepository.update(
      { id: param.id },
      { published: param.published },
    );
  }

  async deleteQuestion(param: { id: string }) {
    await this.questionsRepository.delete({ id: param.id });
  }

  async getFiveRandomQuestions(): Promise<Question[]> {
    return this.questionsRepository
      .createQueryBuilder()
      .orderBy('RANDOM()')
      .limit(5)
      .getMany();
  }
}
