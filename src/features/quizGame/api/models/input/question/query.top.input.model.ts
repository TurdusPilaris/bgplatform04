import { IsOptional } from '@nestjs/class-validator';
import { IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryTopInputModel {
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  sort: string[] = ['avgScores desc', 'sumScore desc'];

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  pageNumber: number = 1;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  pageSize: number = 10;
}
