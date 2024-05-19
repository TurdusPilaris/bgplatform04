import { likeStatus } from '../../../../../base/models/likesStatus';
import { PostDocument } from '../../../domain/entiities/post.entity';

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

export const PostOutputModelMapper = (post: PostDocument): PostOutputModel => {
  const outputPostModel = new PostOutputModel();
  outputPostModel.id = post.id;
  outputPostModel.title = post.title;
  outputPostModel.shortDescription = post.shortDescription;
  outputPostModel.content = post.content;
  outputPostModel.blogId = post.blogId;
  outputPostModel.blogName = post.blogName;
  outputPostModel.createdAt = post.createdAt.toISOString();
  outputPostModel.extendedLikesInfo = new LikesInfoOut();
  outputPostModel.extendedLikesInfo.likesCount = 0;
  outputPostModel.extendedLikesInfo.dislikesCount = 0;
  outputPostModel.extendedLikesInfo.myStatus = likeStatus.None;
  outputPostModel.extendedLikesInfo.newestLikes = [];

  return outputPostModel;
};
