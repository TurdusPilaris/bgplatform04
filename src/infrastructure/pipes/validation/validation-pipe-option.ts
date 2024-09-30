import { BadRequestException, ValidationPipeOptions } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { APIErrorMessageType } from '../../../base/type/types';

export class ValidationPipeOption implements ValidationPipeOptions {
  transform: true;
  stopAtFirstError: true;
  validateCustomDecorators: true;

  exceptionFactory: (errors: ValidationError[]) => any;
  constructor() {
    this.exceptionFactory = (errors: ValidationError[]) => {
      const errorsApi: APIErrorMessageType[] = [];
      errors.forEach((e: ValidationError) => {
        const key: string = Object.keys(e.constraints)[0];
        errorsApi.push({
          field: e.property,
          message: e.constraints[key],
        });
      });

      throw new BadRequestException(errorsApi);
    };
  }
}
