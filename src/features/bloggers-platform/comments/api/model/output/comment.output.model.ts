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
export const CommentOutputModelMapper = (
  comment: CommentDocument,
  myLikes?: likeStatus,
): CommentOutputModel => {
  const outputCommentModel = new CommentOutputModel();
  outputCommentModel.id = comment.id.toString();
  outputCommentModel.content = comment.content;
  outputCommentModel.commentatorInfo = new CommentatorInfo();
  outputCommentModel.commentatorInfo.userId = comment.commentatorInfo.userId;
  outputCommentModel.commentatorInfo.userLogin =
    comment.commentatorInfo.userLogin;
  outputCommentModel.createdAt = comment.createdAt.toISOString();
  outputCommentModel.likesInfo = new LikesInfo();
  outputCommentModel.likesInfo.dislikesCount = comment.likesInfo.countDislikes;
  outputCommentModel.likesInfo.likesCount = comment.likesInfo.countLikes;
  outputCommentModel.likesInfo.myStatus = !myLikes
    ? comment.likesInfo.myStatus
    : myLikes;

  return outputCommentModel;
};
