import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersTorRepository } from '../../../features/user-accaunts/users/infrastructure/users.tor.repository';

@ValidatorConstraint({ name: 'NameIsExist', async: true })
@Injectable()
export class NameIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersTorRepository: UsersTorRepository) {}

  async validate(value: any, args: ValidationArguments) {
    const nameIsExist = await this.usersTorRepository.findByLoginOrEmail(value);
    console.log('nameIsExist', nameIsExist);
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
