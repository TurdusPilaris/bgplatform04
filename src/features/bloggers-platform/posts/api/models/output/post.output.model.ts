import { likeStatus } from '../../../../../../base/models/likesStatus';

class NewestLikeType {
  addedAt: string;
  userId: string;
  login: string;
}

export class PostOutputModel {
  constructor() {}
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: LikesInfoOut;
}

export class LikesInfoOut {
  dislikesCount: number;
  likesCount: number;
  myStatus: likeStatus;
  newestLikes: NewestLikeType[];
}
