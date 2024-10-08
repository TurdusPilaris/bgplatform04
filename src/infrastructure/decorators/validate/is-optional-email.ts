import { applyDecorators } from '@nestjs/common';
import { Trim } from '../transform/trim';
import { IsEmail, IsOptional } from '@nestjs/class-validator';
//Объединение декораторов
export const IsOptionalEmail = () =>
  applyDecorators(IsEmail(), Trim(), IsOptional());
