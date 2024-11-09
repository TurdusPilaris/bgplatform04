import { IsOptional, IsString } from '@nestjs/class-validator';
import { QueryPaginationInputModel } from '../../../../../../base/models/input/query-pagination.input.model';

export class QueryBlogInputModel extends QueryPaginationInputModel {
  @IsOptional()
  @IsString()
  searchNameTerm: string = '';
}
