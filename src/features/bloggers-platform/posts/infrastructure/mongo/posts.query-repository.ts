import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostClass,
  PostDocument,
  PostModelType,
} from '../../domain/entiities/post.entity';
import { QueryPostInputModel } from '../../api/models/input/query-post.model';
import {
  LikesInfoOut,
  PostOutputModel,
} from '../../api/models/output/post.output.model';

import {
  Like,
  LikeModelType,
} from '../../../comments/domain/entities/like.entity';
import { likeStatus } from '../../../../../base/models/likesStatus';
import { PaginationOutputModel } from '../../../../../base/models/output/pagination.output.model';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(PostClass.name)
    private PostModel: PostModelType,
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
  ) {}
  // async findAll(
  //   queryDto: QueryPostInputModel,
  //   userId: string | null,
  //   blogId?: string,
  // ) {
  //   const filter = !blogId ? {} : { blogId: blogId };
  //   const items = await this.PostModel.find(filter, null, {
  //     sort: { [queryDto.sortBy]: queryDto.sortDirection },
  //   })
  //     .skip((queryDto.pageNumber - 1) * queryDto.pageSize)
  //     .limit(queryDto.pageSize)
  //     .exec();
  //
  //   const postIds = items.map((post) => post.id);
  //
  //   const myStatusesForPosts = await this.getLikesByUser(postIds, userId);
  //
  //   const itemsForPaginator = items.map((post) =>
  //     this.postOutputModelMapper(
  //       post,
  //       myStatusesForPosts[post.id.toString()]?.statusLike,
  //     ),
  //   );
  //
  //   const countPosts = await this.PostModel.countDocuments(filter);

  // return this.paginationPostModelMapper(
  //   queryDto,
  //   countPosts,
  //   itemsForPaginator,
  // );
  // }

  // async findById(postId: string, userId: string) {
  //   const post = await this.PostModel.findById(postId, { __v: false });
  //   if (!post) return null;
  //
  //   const myLike = await this.getLikesInfo(postId, userId);
  //   return this.postOutputModelMapper(post, myLike);
  // }

  // async getLikesByUser(postIds: string[], userId: string) {
  //   const likes = await this.LikeModel.find()
  //     .where('parentID')
  //     .in(postIds)
  //     .where('userID')
  //     .equals(userId)
  //     .lean();
  //
  //   return likes.reduce((acc, like) => {
  //     const likeCommentID = like.parentID.toString();
  //
  //     acc[likeCommentID] = like;
  //     return acc;
  //   }, {});
  // }

  // async getLikesInfo(
  //   postId: string,
  //   userId: string | null,
  // ): Promise<likeStatus> {
  //   if (userId) {
  //     const myLike = await this.LikeModel.findOne({
  //       parentID: postId,
  //       userID: userId,
  //     }).lean();
  //     if (!myLike) {
  //       return likeStatus.None;
  //     } else {
  //       return myLike.statusLike;
  //     }
  //   } else {
  //     return likeStatus.None;
  //   }
  // }

  // postOutputModelMapper = (
  //   post: PostDocument,
  //   myLikes?: likeStatus,
  // ): PostOutputModel => {
  //   const outputPostModel = new PostOutputModel();
  //   outputPostModel.id = post.id;
  //   outputPostModel.title = post.title;
  //   outputPostModel.shortDescription = post.shortDescription;
  //   outputPostModel.content = post.content;
  //   outputPostModel.blogId = post.blogId;
  //   outputPostModel.blogName = post.blogName;
  //   outputPostModel.createdAt = post.createdAt.toISOString();
  //   outputPostModel.extendedLikesInfo = new LikesInfoOut();
  //   outputPostModel.extendedLikesInfo.likesCount =
  //     post.likesInfo.countLikes || 0;
  //   outputPostModel.extendedLikesInfo.dislikesCount =
  //     post.likesInfo.countDislikes || 0;
  //   outputPostModel.extendedLikesInfo.myStatus = !myLikes
  //     ? post.likesInfo.myStatus
  //     : myLikes;
  //   outputPostModel.extendedLikesInfo.newestLikes =
  //     post.likesInfo.newestLikes.map(function (newestLikes) {
  //       return {
  //         userId: newestLikes.userId,
  //         addedAt: newestLikes.addedAt.toISOString(),
  //         login: newestLikes.login,
  //       };
  //     });
  //   return outputPostModel;
  // };

  // paginationPostModelMapper = (
  //   query: QueryPostInputModel,
  //   countPosts: number,
  //   items: PostOutputModel[],
  // ): PaginationOutputModel<PostOutputModel[]> => {
  //   return {
  //     pagesCount: Math.ceil(countPosts / query.pageSize),
  //     page: +query.pageNumber,
  //     pageSize: +query.pageSize,
  //     totalCount: countPosts,
  //     items: items,
  //   };
  // };
}
