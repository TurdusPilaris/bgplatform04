import { QuestionsRepository } from '../../../src/features/quizGame/infractructure/questions.repository';
import { Question } from '../../../src/features/quizGame/domain/entities/question.entity';

export const questionTestSeeder = {
  async createElevenQuestionsDTO(questionsRepository: QuestionsRepository) {
    const questions = [];
    questions.push({
      body: 'What is the capital of France?',
      correctAnswers: ['Paris'],
    });
    questions.push({ body: 'What is 2 + 2?', correctAnswers: ['4', 'four'] });

    questions.push({
      body: 'What is the largest ocean on Earth?',
      correctAnswers: ['Pacific Ocean', 'Pacific'],
    });
    questions.push({
      body: 'Who wrote "1984"?',
      correctAnswers: ['George Orwell', 'Orwell'],
    });
    questions.push({
      body: 'What is the chemical symbol for gold?',
      correctAnswers: ['Au'],
    });
    questions.push({
      body: 'Which planet is known as the Red Planet?',
      correctAnswers: ['Mars'],
    });
    questions.push({
      body: 'What is the name of the longest river in the world?',
      correctAnswers: ['Nile', 'Amazon'],
    });
    questions.push({
      body: 'What is 9 multiplied by 8?',
      correctAnswers: ['72', 'seventy-two'],
    });
    questions.push({
      body: 'What is the boiling point of water in Celsius?',
      correctAnswers: ['100', 'one hundred'],
    });
    questions.push({
      body: 'Who developed the theory of relativity?',
      correctAnswers: ['Albert Einstein', 'Einstein'],
    });
    questions.push({
      body: 'What programming language is used for Android app development?',
      correctAnswers: ['Java', 'Kotlin'],
    });

    const arrayEntityQuestion = questions.map((dto) =>
      Question.create(dto.body, dto.correctAnswers),
    );
    await questionsRepository.createQuestions(arrayEntityQuestion);
    await questionsRepository.publishAllQuestions();

    return arrayEntityQuestion;
  },
};
