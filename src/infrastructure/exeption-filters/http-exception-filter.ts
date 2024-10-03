import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  APIErrorMessageType,
  APIErrorsMessageType,
} from '../../base/type/types';

// https://docs.nestjs.com/exception-filters
//filter for only http exception
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === HttpStatus.BAD_REQUEST) {
      const errorsResponse: APIErrorsMessageType = {
        errorsMessages: [],
      };

      const responseBody: any = exception.getResponse();

      if (Array.isArray(responseBody.message)) {
        responseBody.message.forEach((e: APIErrorMessageType) =>
          errorsResponse.errorsMessages.push(e),
        );
      } else {
        errorsResponse.errorsMessages.push(responseBody.message);
      }

      response.status(status).json(errorsResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
// global filter
@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(500).json({
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
    console.log('exception', exception);
    // const status = exception.getStatus();
    //
    // if (status === HttpStatus.BAD_REQUEST) {
    //   const errorsResponse = {
    //     errorsMessages: [],
    //   };
    //
    //   const responseBody: any = exception.getResponse();
    //
    //   if (Array.isArray(responseBody.message)) {
    //     responseBody.message.forEach((e: { message: string; field: string }) =>
    //       errorsResponse.errorsMessages.push(e),
    //     );
    //   } else {
    //     errorsResponse.errorsMessages.push(responseBody.message);
    //   }
    //
    //   response.status(status).json(errorsResponse);
    // } else {
    //   response.status(status).json({
    //     statusCode: status,
    //     timestamp: new Date().toISOString(),
    //     path: request.url,
    //   });
    // }
  }
}
