import { likeStatus } from '../../../../../../base/models/likesStatus';

export class CommentOutputModel {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: CommentLikesInfo;
  constructor(
    id: string,
    commentatorId: string,
    commentatorName: string,
    content: string,
    createdAt: Date,
    countLikes: number,
    countDislikes: number,
    myStatus: likeStatus,
  ) {
    this.id = id;
    this.content = content;
    this.commentatorInfo = new CommentatorInfo(commentatorId, commentatorName);
    this.createdAt = createdAt.toISOString();
    this.likesInfo = new CommentLikesInfo(countLikes, countDislikes, myStatus);
  }
}
export class CommentatorInfo {
  userId: string;
  userLogin: string;
  constructor(userId: string, userLogin: string) {
    this.userId = userId;
    this.userLogin = userLogin;
  }
}

export class CommentLikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: likeStatus;
  constructor(countLikes: number, countDislikes: number, myStatus: likeStatus) {
    this.likesCount = +countLikes;
    this.dislikesCount = +countDislikes;
    this.myStatus = myStatus;
  }
}
