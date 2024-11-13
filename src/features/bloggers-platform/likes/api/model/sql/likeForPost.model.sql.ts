import { likeStatus } from '../../../../../../base/models/likesStatus';

export class LikeForPostSQL {
  id: string;
  postId: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
  likesInfo: CommentLikesInfo;
  constructor(
    id: string,
    postId: string,
    commentatorId: string,
    commentatorName: string,
    content: string,
    createdAt: Date,
    countLikes: number,
    countDislikes: number,
    myStatus: likeStatus,
  ) {
    this.id = id;
    this.postId = postId;
    this.content = content;
    this.commentatorInfo = new CommentatorInfo(commentatorId, commentatorName);
    this.createdAt = createdAt;
    this.likesInfo = new CommentLikesInfo(countLikes, countDislikes, myStatus);
  }
}
class CommentatorInfo {
  userId: string;
  userLogin: string;
  constructor(userId: string, userLogin: string) {
    this.userId = userId;
    this.userLogin = userLogin;
  }
}

class CommentLikesInfo {
  countLikes: number;
  countDislikes: number;
  myStatus: likeStatus;
  constructor(countLikes: number, countDislikes: number, myStatus: likeStatus) {
    this.countLikes = countLikes;
    this.countDislikes = countDislikes;
    this.myStatus = myStatus;
  }
}
