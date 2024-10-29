import { IsEnum } from 'class-validator';
import { likeStatus } from '../../../../../../base/models/likesStatus';

export class CreateLikeInputModel {
  @IsEnum(likeStatus)
  likeStatus: string;
}
