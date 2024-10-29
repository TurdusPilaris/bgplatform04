import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostClass, PostModelType } from '../domain/entiities/post.entity';
import { QueryPostInputModel } from '../api/models/input/query-post.model';
import { postOutputModelMapper } from '../api/models/output/post.output.model';
import { PaginationPostModelMapper } from '../api/models/output/pagination-post.model';

import {
  Like,
  LikeModelType,
} from '../../comments/domain/entities/like.entity';
import { likeStatus } from '../../../../base/models/likesStatus';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(PostClass.name)
    private PostModel: PostModelType,
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
  ) {}
  async findAll(
    queryDto: QueryPostInputModel,
    userId: string | null,
    blogId?: string,
  ) {
    const filter = !blogId ? {} : { blogId: blogId };
    const items = await this.PostModel.find(filter, null, {
      sort: { [queryDto.sortBy]: queryDto.sortDirection },
    })
      .skip((queryDto.pageNumber - 1) * queryDto.pageSize)
      .limit(queryDto.pageSize)
      .exec();

    const postIds = items.map((post) => post.id);

    const myStatusesForPosts = await this.getLikesByUser(postIds, userId);

    const itemsForPaginator = items.map((post) =>
      postOutputModelMapper(
        post,
        myStatusesForPosts[post.id.toString()]?.statusLike,
      ),
    );

    const countPosts = await this.PostModel.countDocuments(filter);

    return PaginationPostModelMapper(queryDto, countPosts, itemsForPaginator);
  }

  async findById(postId: string, userId: string) {
    const post = await this.PostModel.findById(postId, { __v: false });
    if (!post) return null;

    const myLike = await this.getLikesInfo(postId, userId);
    return postOutputModelMapper(post, myLike);
  }

  async getLikesByUser(postIds: string[], userId: string) {
    const likes = await this.LikeModel.find()
      .where('parentID')
      .in(postIds)
      .where('userID')
      .equals(userId)
      .lean();

    return likes.reduce((acc, like) => {
      const likeCommentID = like.parentID.toString();

      acc[likeCommentID] = like;
      return acc;
    }, {});
  }

  async getLikesInfo(
    postId: string,
    userId: string | null,
  ): Promise<likeStatus> {
    if (userId) {
      const myLike = await this.LikeModel.findOne({
        parentID: postId,
        userID: userId,
      }).lean();
      if (!myLike) {
        return likeStatus.None;
      } else {
        return myLike.statusLike;
      }
    } else {
      return likeStatus.None;
    }
  }
}
