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
}
