import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersTorRepository } from '../../../features/user-accaunts/users/infrastructure/tor/users.tor.repository';

@ValidatorConstraint({ name: 'NameIsExist', async: true })
@Injectable()
export class IsBooleanStrictConstraint implements ValidatorConstraintInterface {
  constructor() {}

  validate(value: any, args: ValidationArguments) {
    if (value === undefined || value === null) {
      // Ошибка, если значение отсутствует
      return false;
    }

    return typeof value === 'boolean';
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments.property} must be a boolean, not a string`;
  }
}

export function IsBooleanStrict(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsBooleanStrictConstraint,
    });
  };
}
