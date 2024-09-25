import { IsOptional } from '@nestjs/class-validator';

import { IsIn, IsNumber } from 'class-validator';

import { Type } from 'class-transformer';

export class QueryPaginationInputModel {
  @IsOptional()
  sortBy: string = 'createdAt';

  @IsIn(['asc', 'desc'])
  sortDirection: string = 'desc';

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  pageNumber: number = 1;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  pageSize: number = 10;
}
