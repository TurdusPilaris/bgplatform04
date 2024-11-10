import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostClass, PostModelType } from '../domain/entiities/post.entity';
import { QueryPostInputModel } from '../api/models/input/query-post.model';
import {
  LikesInfoOut,
  PostOutputModel,
} from '../api/models/output/post.output.model';

import {
  Like,
  LikeModelType,
} from '../../comments/domain/entities/like.entity';
import { likeStatus } from '../../../../base/models/likesStatus';
import { PaginationOutputModel } from '../../../../base/models/output/pagination.output.model';
import { DataSource } from 'typeorm';
import { PostSQL } from '../api/models/sql/post.sql.model';

@Injectable()
export class PostsSqlQueryRepository {
  constructor(
    @InjectModel(PostClass.name)
    private PostModel: PostModelType,
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
    protected dataSource: DataSource,
  ) {}
  async findAll(
    queryDto: QueryPostInputModel,
    userId: string | null,
    blogId?: string,
  ) {
    const conditionForBlog = !blogId ? '' : ' WHERE b.id = $3';
    const query = `
    SELECT p.id, p."blogId", p.title, p."shortDescription", p.content, p."createdAt", b.name as "blogName"
    FROM public."Posts" as p
    LEFT JOIN public."Blogs" as b
    ON p."blogId" = b.id
    ${conditionForBlog}
        ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
        LIMIT $1 OFFSET $2
    `;

    const parametersForPosts: (number | string)[] = [
      queryDto.pageSize,
      (queryDto.pageNumber - 1) * queryDto.pageSize,
    ];
    if (blogId) parametersForPosts.push(blogId);
    const res: PostSQL[] = await this.dataSource.query(
      query,
      parametersForPosts,
    );

    const countPosts = await this.getCountPostByFilter(blogId);

    const itemsForPaginator = res.map((post) =>
      this.postOutputModelMapper(post, likeStatus.None),
    );

    return this.paginationPostModelMapper(
      queryDto,
      countPosts,
      itemsForPaginator,
    );
  }

  async getCountPostByFilter(blogId?: string) {
    const conditionForBlog = !blogId ? '' : ' WHERE b.id = $1';
    const query = `
    SELECT count(*) as "countOfPosts"
    FROM public."Posts" as p
    LEFT JOIN public."Blogs" as b
    ON p."blogId" = b.id
    ${conditionForBlog}
    `;

    let res;
    if (blogId) {
      res = await this.dataSource.query(query, [blogId]);
    } else {
      res = await this.dataSource.query(query);
    }

    return +res[0].countOfPosts;
  }
  async findById(postId: string, userId?: string) {
    const query = `
    SELECT p.id, p."blogId", p.title, p."shortDescription", p.content, p."createdAt", b.name as "blogName"
    FROM public."Posts" as p
    LEFT JOIN public."Blogs" as b
    ON p."blogId" = b.id
    WHERE p.id = $1
    `;

    const foundPosts: PostSQL[] = await this.dataSource.query(query, [postId]);
    // const post = await this.PostModel.findById(postId, { __v: false });
    // if (!post) return null;
    //
    // const myLike = await this.getLikesInfo(postId, userId);
    return this.postOutputModelMapper(foundPosts[0], likeStatus.None);
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

  postOutputModelMapper = (
    post: PostSQL,
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
    outputPostModel.extendedLikesInfo.likesCount = 0;
    // post.likesInfo.countLikes || 0;
    outputPostModel.extendedLikesInfo.dislikesCount = 0;
    // post.likesInfo.countDislikes || 0;
    outputPostModel.extendedLikesInfo.myStatus = myLikes;
    // !myLikes
    // ? post.likesInfo.myStatus
    // : myLikes;
    outputPostModel.extendedLikesInfo.newestLikes = [];
    // post.likesInfo.newestLikes.map(function (newestLikes) {
    //   return {
    //     userId: newestLikes.userId,
    //     addedAt: newestLikes.addedAt.toISOString(),
    //     login: newestLikes.login,
    //   };
    // });
    return outputPostModel;
  };

  paginationPostModelMapper = (
    query: QueryPostInputModel,
    countPosts: number,
    items: PostOutputModel[],
  ): PaginationOutputModel<PostOutputModel[]> => {
    return {
      pagesCount: Math.ceil(countPosts / query.pageSize),
      page: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount: countPosts,
      items: items,
    };
  };
}
