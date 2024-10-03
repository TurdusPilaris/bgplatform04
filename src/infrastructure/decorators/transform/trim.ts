// Custom decorator (в библиотеке class-transformer по умолчанию нету декоратора trim)
// не забываем установить transform: true в глобальном ValidationPipe

import { Transform, TransformFnParams } from 'class-transformer';

export const Trim = () =>
  Transform(({ value }: TransformFnParams) => value?.trim());
// Transform((params: TransformFnParams) => params.value?.trim());
