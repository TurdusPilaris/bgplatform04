import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthBasicGuard } from '../../../../infrastructure/guards/auth.basic.guard';
import { PaginationQuestionInputModel } from '../models/input/question/pagination.question.input.model';
import { QuestionsQueryRepository } from '../../infractructure/questions.query-repository';
import { QuestionInputModel } from '../models/input/question/question.input.model';
import { CreateQuestionCommand } from '../../application/use-cases/questions/create-question-use-case';
import { DeleteQuestionCommand } from '../../application/use-cases/questions/delete-question-use-case';
import { ErrorProcessor } from '../../../../base/models/errorProcessor';
import { UpdateQuestionCommand } from '../../application/use-cases/questions/update-question-use-case';
import { QuestionPublishInputModel } from '../models/input/question/question.publish.input.model';
import { UpdatePublishQuestionCommand } from '../../application/use-cases/questions/update-publish-question-use-case';

@Controller('sa/quiz/questions')
export class QuizSaController {
  constructor(
    private commandBus: CommandBus,
    protected questionsQueryRepository: QuestionsQueryRepository,
  ) {}

  @Get()
  @UseGuards(AuthBasicGuard)
  @HttpCode(200)
  async getQuestions(
    @Query()
    queryDto: PaginationQuestionInputModel,
  ) {
    return await this.questionsQueryRepository.getAll(queryDto);
  }

  @Post()
  @UseGuards(AuthBasicGuard)
  @HttpCode(201)
  async createQuestion(
    @Body()
    inputModel: QuestionInputModel,
  ) {
    const { questionId } = await this.commandBus.execute(
      new CreateQuestionCommand(inputModel.body, inputModel.correctAnswers),
    );
    return this.questionsQueryRepository.getById(questionId);
  }

  @Delete(':id')
  @UseGuards(AuthBasicGuard)
  @HttpCode(204)
  async deleteQuestion(
    @Param('id', new ParseUUIDPipe())
    questionId: string,
  ) {
    const result = await this.commandBus.execute(
      new DeleteQuestionCommand(questionId),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
    return;
  }

  @Put(':id')
  @UseGuards(AuthBasicGuard)
  @HttpCode(204)
  async updateQuestion(
    @Param('id', new ParseUUIDPipe()) questionId: string,
    @Body() updateModel: QuestionInputModel,
  ) {
    const result = await this.commandBus.execute(
      new UpdateQuestionCommand(
        questionId,
        updateModel.body,
        updateModel.correctAnswers,
      ),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
    return;
  }

  @Put(':id/publish')
  @UseGuards(AuthBasicGuard)
  @HttpCode(204)
  async updatePublishOfQuestion(
    @Param('id', new ParseUUIDPipe()) questionId: string,
    @Body() updateModel: QuestionPublishInputModel,
  ) {
    const result = await this.commandBus.execute(
      new UpdatePublishQuestionCommand(questionId, updateModel.publish),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
    return;
  }
}
