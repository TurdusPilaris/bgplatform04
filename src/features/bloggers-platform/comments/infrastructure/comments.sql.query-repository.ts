import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CommentOutputModel } from '../api/model/output/comment.output.model';
import { CommentSQL } from '../api/model/sql/comment.model.sql';
import { QueryCommentModel } from '../api/model/input/query-comment.model';
import { QueryPostInputModel } from '../../posts/api/models/input/query-post.model';
import { PaginationOutputModel } from '../../../../base/models/output/pagination.output.model';

@Injectable()
export class CommentsSqlQueryRepository {
  constructor(protected dataSource: DataSource) {}

  async findAll(
    queryDto: QueryCommentModel,
    postId: string,
    userId: string | null,
  ) {
    const query = `
      
        with countLikesAndDislike AS(
            SELECT count(*) as "count", "statusLike", "commentId"
            FROM "LikeForComment"
            GROUP BY "statusLike", "commentId"
          ),
        likeForCurrentUser AS(
            SELECT "statusLike", "commentId"
            FROM "LikeForComment"
            WHERE "userId" = $4

        )
        SELECT 
            comm.id, 
            comm.content,
            comm."postId",
            comm."commentatorId",
            comm."createdAt",
            users."userName" as "commentatorName",
            COALESCE(countDislike."count", 0) as "dislikesCount",
            COALESCE(countLike."count", 0) as "likesCount",
            COALESCE(likeForCurrentUser."statusLike", 'None') as "myStatus"
                FROM public."Comments" as comm
                LEFT JOIN public."Users" as users
                ON comm."commentatorId" = users.id
                LEFT JOIN countLikesAndDislike as countDislike ON comm.id = countDislike."commentId" AND countDislike."statusLike" = 'Dislike'
                LEFT JOIN countLikesAndDislike as countLike  ON comm.id = countLike."commentId" AND countLike."statusLike" = 'Like'
                LEFT JOIN likeForCurrentUser ON  comm.id = likeForCurrentUser."commentId"
                WHERE comm."postId" = $3
                ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
                LIMIT $1 OFFSET $2
        `;

    const parametersForPosts: (number | string)[] = [
      queryDto.pageSize,
      (queryDto.pageNumber - 1) * queryDto.pageSize,
      postId,
      !userId ? '00000000-0000-0000-0000-000000000000' : userId,
    ];

    const res: CommentSQL[] = await this.dataSource.query(
      query,
      parametersForPosts,
    );

    const countComments = await this.getCountCommentByFilter(postId);

    const itemsForPaginator = res.map((comment) =>
      this.commentOutputModelMapper(comment),
    );
    return this.paginationCommentModelMapper(
      queryDto,
      countComments,
      itemsForPaginator,
    );
  }

  paginationCommentModelMapper = (
    query: QueryPostInputModel,
    countPosts: number,
    items: CommentOutputModel[],
  ): PaginationOutputModel<CommentOutputModel[]> => {
    return {
      pagesCount: Math.ceil(countPosts / query.pageSize),
      page: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount: countPosts,
      items: items,
    };
  };
  async findCommentById(
    id: string,
    userId: string | null,
  ): Promise<CommentOutputModel | null> {
    const query = `
      
        with countLikesAndDislike AS(
            SELECT count(*) as "count", "statusLike", "commentId"
            FROM "LikeForComment"
            WHERE "commentId" = $1
            GROUP BY "statusLike", "commentId"
          ),
        likeForCurrentUser AS(
            SELECT "statusLike", "commentId"
            FROM "LikeForComment"
            WHERE "commentId" = $1 AND "userId" = $2

        )
        SELECT 
            comm.id, 
            comm.content,
            comm."postId",
            comm."commentatorId",
            comm."createdAt",
            users."userName" as "commentatorName",
            COALESCE(countDislike."count", 0) as "dislikesCount",
            COALESCE(countLike."count", 0) as "likesCount",
            COALESCE(likeForCurrentUser."statusLike", 'None') as "myStatus"
                FROM public."Comments" as comm
                LEFT JOIN public."Users" as users
                ON comm."commentatorId" = users.id
                LEFT JOIN countLikesAndDislike as countDislike ON comm.id = countDislike."commentId" AND countDislike."statusLike" = 'Dislike'
                LEFT JOIN countLikesAndDislike as countLike  ON comm.id = countLike."commentId" AND countLike."statusLike" = 'Like'
                LEFT JOIN likeForCurrentUser ON  comm.id = likeForCurrentUser."commentId"
                WHERE comm."id" = $1

        `;
    const res: CommentSQL[] = await this.dataSource.query(query, [
      id,
      !userId ? '00000000-0000-0000-0000-000000000000' : userId,
    ]);

    if (res.length === 0) return null;

    return res.map((e) => {
      return new CommentOutputModel(
        e.id,
        e.commentatorId,
        e.commentatorName,
        e.content,
        e.createdAt,
        e.likesCount,
        e.dislikesCount,
        e.myStatus,
      );
    })[0];
  }

  async getCountCommentByFilter(postId: string) {
    const query = `
    SELECT count(*) as "countOfComements"
	      FROM public."Comments"
	      WHERE "postId" = $1
    `;

    const res = await this.dataSource.query(query, [postId]);

    return +res[0].countOfComements;
  }

  commentOutputModelMapper = (comment: CommentSQL): CommentOutputModel => {
    return new CommentOutputModel(
      comment.id,
      comment.commentatorId,
      comment.commentatorName,
      comment.content,
      comment.createdAt,
      comment.likesCount,
      comment.dislikesCount,
      comment.myStatus,
    );
  };
  // async findForOutput(id: string) {
  //   const foundComment = await this.findCommentById(id);
  //   if (!foundComment) {
  //     return null;
  //   }
  //   return this.commentOutputModelMapper(foundComment, undefined);
  // }
  //
  // async findCommentWithLikesForOutput(id: string, userId: string | null) {
  //   const foundComment = await this.findCommentById(id);
  //   if (!foundComment) {
  //     return null;
  //   }
  //
  //   const myLike = await this.getLikesInfo(id.toString(), userId);
  //   return this.commentOutputModelMapper(foundComment, myLike);
  // }
  //
  //   async getLikesInfo(
  //     parentId: string,
  //     userId: string | null,
  //   ): Promise<likeStatus> {
  //     if (userId) {
  //       const myLike = await this.LikeModel.findOne({
  //         parentID: parentId,
  //         userID: userId,
  //       }).lean();
  //       if (!myLike) {
  //         return likeStatus.None;
  //       } else {
  //         return myLike.statusLike;
  //       }
  //     } else {
  //       return likeStatus.None;
  //     }
  //   }
  //
  //   async getLikesByUser(commentsIds: any[], userId: string) {
  //     const likes = await this.LikeModel.find()
  //       .where('parentID')
  //       .in(commentsIds)
  //       .where('userID')
  //       .equals(userId)
  //       .lean();
  //
  //     return likes.reduce((acc, like) => {
  //       const likeCommentID = like.parentID.toString();
  //
  //       acc[likeCommentID] = like;
  //       return acc;
  //     }, {});
  //   }
  //
  //   commentOutputModelMapper = (
  //     comment: CommentDocument,
  //     myLikes?: likeStatus,
  //   ): CommentOutputModel => {
  //     const outputCommentModel = new CommentOutputModel();
  //     outputCommentModel.id = comment.id.toString();
  //     outputCommentModel.content = comment.content;
  //     outputCommentModel.commentatorInfo = new CommentatorInfo();
  //     outputCommentModel.commentatorInfo.userId = comment.commentatorInfo.userId;
  //     outputCommentModel.commentatorInfo.userLogin =
  //       comment.commentatorInfo.userLogin;
  //     outputCommentModel.createdAt = comment.createdAt.toISOString();
  //     outputCommentModel.likesInfo = new LikesInfo();
  //     outputCommentModel.likesInfo.dislikesCount =
  //       comment.likesInfo.countDislikes;
  //     outputCommentModel.likesInfo.likesCount = comment.likesInfo.countLikes;
  //     outputCommentModel.likesInfo.myStatus = !myLikes
  //       ? comment.likesInfo.myStatus
  //       : myLikes;
  //
  //     return outputCommentModel;
  //   };
  //
  //   paginationCommentModelMapper = (
  //     query: QueryCommentModel,
  //     countComments: number,
  //     items: CommentOutputModel[],
  //   ): PaginationOutputModel<CommentOutputModel[]> => {
  //     return {
  //       pagesCount: Math.ceil(countComments / query.pageSize),
  //       page: +query.pageNumber,
  //       pageSize: +query.pageSize,
  //       totalCount: countComments,
  //       items: items,
  //     };
  //   };
}
