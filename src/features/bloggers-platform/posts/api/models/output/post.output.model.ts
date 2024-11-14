import { likeStatus } from '../../../../../../base/models/likesStatus';

export class PostOutputModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: LikesInfoOut;
  constructor(
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: Date,
    dislikesCount: number,
    likesCount: number,
    myStatus: likeStatus,
    newestLikes: NewestLike[],
  ) {
    this.id = id;
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogId = blogId;
    this.blogName = blogName;
    this.createdAt = createdAt.toISOString();
    this.extendedLikesInfo = new LikesInfoOut(
      dislikesCount,
      likesCount,
      myStatus,
      newestLikes,
    );
  }
}

export class LikesInfoOut {
  dislikesCount: number;
  likesCount: number;
  myStatus: likeStatus;
  newestLikes: NewestLike[];
  constructor(
    dislikesCount: number,
    likesCount: number,
    myStatus: likeStatus,
    newestLikes: NewestLike[],
  ) {
    this.dislikesCount = +dislikesCount;
    this.likesCount = +likesCount;
    this.myStatus = myStatus;
    this.newestLikes = newestLikes;
  }
}

export class NewestLike {
  addedAt: string;
  userId: string;
  login: string;

  constructor(addedAt: string, userId: string, login: string) {
    this.addedAt = addedAt;
    this.userId = userId;
    this.login = login;
  }
}
