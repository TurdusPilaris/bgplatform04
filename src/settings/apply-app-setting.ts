import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// import { LoggerMiddlewareFunc } from '../infrastructure/middlewares/logger.middleware';
import {
  ErrorFilter,
  HttpExceptionFilter,
} from '../infrastructure/exeption-filters/http-exception-filter';
import { useContainer } from 'class-validator';
import { AppModule } from '../app.module';

// Префикс нашего приложения (http://site.com/api)
const APP_PREFIX = '/api';

// Используем данную функцию в main.ts и в e2e тестах
export const applyAppSettings = (app: INestApplication) => {
  //Для внедрения зависимостей в valodator constraint
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  // Применение глобальных Interceptors
  // app.useGlobalInterceptors()

  // Применение глобальных Guards
  //  app.useGlobalGuards(new AuthGuard());

  // Применить middleware глобально
  // app.use(LoggerMiddlewareFunc);

  // Установка префикса
  // setAppPrefix(app);

  // Конфигурация swagger документации
  // setSwagger(app);

  // Применение глобальных pipes
  setAppPipes(app);

  // Применение глобальных exceptions filters
  setAppExceptionsFilters(app);
};

const setAppPrefix = (app: INestApplication) => {
  // Устанавливается для разворачивания front-end и back-end на одном домене
  // https://site.com - front-end
  // https://site.com/api - backend-end
  app.setGlobalPrefix(APP_PREFIX);
};

// const setSwagger = (app: INestApplication) => {
//     if (!appSettings.env.isProduction()) {
//         const swaggerPath = APP_PREFIX + '/swagger-doc';
//
//         const config = new DocumentBuilder()
//             .setTitle('BLOGGER API')
//             .addBearerAuth()
//             .setVersion('1.0')
//             .build();
//
//         const document = SwaggerModule.createDocument(app, config);
//         SwaggerModule.setup(swaggerPath, app, document, {
//             customSiteTitle: 'Blogger Swagger',
//         });
//     }
// };

const setAppPipes = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      // Для работы трансформации входящих данных
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      // Выдавать первую ошибку для каждого поля
      stopAtFirstError: true,
      // Перехватываем ошибку, кастомизируем её и выкидываем 400 с собранными данными
      exceptionFactory: (errors) => {
        const customErrors: any[] = [];

        errors.forEach((e) => {
          const constraintKeys = Object.keys(e.constraints);
          constraintKeys.forEach((cKey) => {
            const msg = e.constraints[cKey];

            customErrors.push({ message: msg, field: e.property });
          });
        });

        // Error 400
        throw new BadRequestException(customErrors);
      },
    }),
  );
};

const setAppExceptionsFilters = (app: INestApplication) => {
  app.useGlobalFilters(new ErrorFilter(), new HttpExceptionFilter());
};
