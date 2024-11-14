import { likeStatus } from '../../../../../../base/models/likesStatus';

export class LikeForCommentSQL {
  id: string;
  commentId: string;
  userId: string;
  login: string;
  statusLike: likeStatus;
  createdAt: Date;
  updatedAt: Date;
  constructor(
    id: string,
    commentId: string,
    userId: string,
    login: string,
    statusLike: likeStatus,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.commentId = commentId;
    this.userId = userId;
    this.login = login;
    this.statusLike = statusLike;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
