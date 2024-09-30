// Custom decorator (в библиотеке class-transformer по умолчанию нету декоратора trim)
// не забываем установить transform: true в глобальном ValidationPipe
import { Transform, TransformFnParams } from '@nestjs/class-transformer';

//нужно установить transform: true в ValidationPipe
export const Trim = () =>
  // Transform(({ value }: TransformFnParams) => value?.trim());
  Transform((params: TransformFnParams) => params.value?.trim());
