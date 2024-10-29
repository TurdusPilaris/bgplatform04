import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../features/userAccaunts/users/infrastructure/users.repository';

@ValidatorConstraint({ name: 'NameIsExist', async: true })
@Injectable()
export class NameIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) {}

  async validate(value: any, args: ValidationArguments) {
    console.log('value----------------------', value);
    console.log('args----------------------', args);
    console.log('this----------------------', this);
    console.log(
      'this.usersRepository----------------------',
      this.usersRepository,
    );
    const nameIsExist = await this.usersRepository.findByLoginOrEmail(value);
    return !nameIsExist;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Name ${validationArguments?.value} already exist`;
  }
}

export function NameIsExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: NameIsExistConstraint,
    });
  };
}
