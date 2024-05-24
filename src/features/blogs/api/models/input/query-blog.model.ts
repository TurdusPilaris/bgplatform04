import { QueryPaginationInputModel } from '../../../../../base/models/input/query-pagination.input.model';
import { IsOptional } from '@nestjs/class-validator';

export class QueryBlogInputModel extends QueryPaginationInputModel {
  @IsOptional()
  searchNameTerm: { type: string };
}
