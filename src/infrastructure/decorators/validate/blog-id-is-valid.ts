import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../../features/bloggers-platform/blogs/infrastructure/blogs.repository';

@ValidatorConstraint({ name: 'BlogIdIsValid', async: true })
@Injectable()
export class BlogIdIsValidConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async validate(value: any, args: ValidationArguments) {
    const blog = await this.blogsRepository.findById(value);
    return !!blog;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Blog ${validationArguments?.value} is not exist`;
  }
}

export function BlogIdIsValid(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: BlogIdIsValidConstraint,
    });
  };
}
