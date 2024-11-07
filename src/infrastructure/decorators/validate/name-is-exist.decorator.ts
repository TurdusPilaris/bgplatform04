import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../features/user-accaunts/users/infrastructure/users.repository';
import { UsersSqlRepository } from '../../../features/user-accaunts/users/infrastructure/users.sql.repositories';

@ValidatorConstraint({ name: 'NameIsExist', async: true })
@Injectable()
export class NameIsExistConstraint implements ValidatorConstraintInterface {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersSqlRepository: UsersSqlRepository,
  ) {}

  async validate(value: any, args: ValidationArguments) {
    const nameIsExist = await this.usersSqlRepository.findByLoginOrEmail(value);
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
