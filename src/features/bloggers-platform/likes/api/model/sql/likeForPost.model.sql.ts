import { likeStatus } from '../../../../../../base/models/likesStatus';

export class LikeForPostSQL {
  id: string;
  postId: string;
  userId: string;
  login: string;
  statusLike: likeStatus;
  createdAt: Date;
  updatedAt: Date;
  constructor(
    id: string,
    postId: string,
    userId: string,
    login: string,
    statusLike: likeStatus,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.postId = postId;
    this.userId = userId;
    this.login = login;
    this.statusLike = statusLike;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
