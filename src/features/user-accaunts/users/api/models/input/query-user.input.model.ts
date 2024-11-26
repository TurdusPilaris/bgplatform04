import { QueryPaginationInputModel } from '../../../../../../base/models/input/query-pagination.input.model';
import { IsString } from '@nestjs/class-validator';

export class QueryUserInputModel extends QueryPaginationInputModel {
  // searchLoginTerm: { type: string };
  // searchEmailTerm: { type: string };
  @IsString()
  searchLoginTerm: string = '';
  @IsString()
  searchEmailTerm: string = '';
}
