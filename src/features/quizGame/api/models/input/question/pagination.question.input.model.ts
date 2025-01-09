import { QueryPaginationInputModel } from '../../../../../../base/models/input/query-pagination.input.model';
import { IsOptional, IsString } from '@nestjs/class-validator';
import { PublishedStatus } from '../../../../../../base/models/publishedStatus';
import { IsEnum } from 'class-validator';

export class PaginationQuestionInputModel extends QueryPaginationInputModel {
  @IsOptional()
  @IsString()
  bodySearchTerm: string = '';

  @IsEnum(PublishedStatus, {
    message: 'publishedStatus must be one of: all, published, unpublished',
  })
  publishedStatus: PublishedStatus = PublishedStatus.All;
}
