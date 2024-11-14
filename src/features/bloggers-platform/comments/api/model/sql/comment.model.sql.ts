import { likeStatus } from '../../../../../../base/models/likesStatus';

export class CommentSQL {
  id: string;
  postId: string;
  commentatorId: string;
  content: string;
  createdAt: Date;
  commentatorName: string;
  dislikesCount: number;
  likesCount: number;
  myStatus: likeStatus;

  constructor(
    id: string,
    postId: string,
    commentatorId: string,
    commentatorName: string,
    content: string,
    createdAt: Date,
    dislikesCount: number,
    likesCount: number,
    myStatus: likeStatus,
  ) {
    this.id = id;
    this.postId = postId;
    this.content = content;
    this.commentatorId = commentatorId;
    this.commentatorName = commentatorName;
    this.createdAt = createdAt;
    this.dislikesCount = dislikesCount;
    this.likesCount = likesCount;
    this.myStatus = myStatus;
  }
}
