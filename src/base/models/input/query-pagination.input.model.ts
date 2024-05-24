import { IsOptional, IsString, Length } from '@nestjs/class-validator';
import { DefaultValuePipe } from '@nestjs/common';
import { IsIn, IsNumber, IsNumberString } from 'class-validator';
import { Transform } from '@nestjs/class-transformer';
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
