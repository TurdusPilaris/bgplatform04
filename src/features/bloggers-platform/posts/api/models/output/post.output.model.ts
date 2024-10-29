import { PostDocument } from '../../../domain/entiities/post.entity';
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

export const postOutputModelMapper = (
  post: PostDocument,
  myLikes?: likeStatus,
): PostOutputModel => {
  const outputPostModel = new PostOutputModel();
  outputPostModel.id = post.id;
  outputPostModel.title = post.title;
  outputPostModel.shortDescription = post.shortDescription;
  outputPostModel.content = post.content;
  outputPostModel.blogId = post.blogId;
  outputPostModel.blogName = post.blogName;
  outputPostModel.createdAt = post.createdAt.toISOString();
  outputPostModel.extendedLikesInfo = new LikesInfoOut();
  outputPostModel.extendedLikesInfo.likesCount = post.likesInfo.countLikes || 0;
  outputPostModel.extendedLikesInfo.dislikesCount =
    post.likesInfo.countDislikes || 0;
  outputPostModel.extendedLikesInfo.myStatus = !myLikes
    ? post.likesInfo.myStatus
    : myLikes;
  outputPostModel.extendedLikesInfo.newestLikes =
    post.likesInfo.newestLikes.map(function (newestLikes) {
      return {
        userId: newestLikes.userId,
        addedAt: newestLikes.addedAt.toISOString(),
        login: newestLikes.login,
      };
    });
  return outputPostModel;
};
