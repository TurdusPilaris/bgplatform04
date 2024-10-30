import { CommentDocument } from '../../../domain/entities/comment.entity';
import { likeStatus } from '../../../../../../base/models/likesStatus';

export class CommentOutputModel {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfo;
}

export class CommentatorInfo {
  userId: string;
  userLogin: string;
}

export class LikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
}
