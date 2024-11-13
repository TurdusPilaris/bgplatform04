import { Injectable } from '@nestjs/common';
// import {
//   Comment,
//   CommentDocument,
//   CommentModelType,
// } from '../domain/entities/comment.entity';
// import { InjectModel } from '@nestjs/mongoose';
// import { QueryCommentModel } from '../api/model/input/query-comment.model';
// import {
//   CommentatorInfo,
//   CommentOutputModel,
//   LikesInfo,
// } from '../api/model/output/comment.output.model';
// import { Like, LikeModelType } from '../domain/entities/like.entity';
// import { likeStatus } from '../../../../base/models/likesStatus';
// import { PaginationOutputModel } from '../../../../base/models/output/pagination.output.model';
import { DataSource } from 'typeorm';
// import { CommentSQL } from '../api/model/sql/comment.model.sql';
//
@Injectable()
export class CommentsSqlQueryRepository {
  constructor(
    // @InjectModel(Comment.name)
    // private CommentModel: CommentModelType,
    // @InjectModel(Like.name)
    // private LikeModel: LikeModelType,
    protected dataSource: DataSource,
  ) {}
  //
  //   async findAll(
  //     queryDto: QueryCommentModel,
  //     postId: string,
  //     userId: string | null,
  //   ) {
  //     // : Promise<PaginationCommentModel>
  //     const filterByPostID = { postId: postId };
  //     const items = await this.CommentModel.find(filterByPostID, null, {
  //       sort: { [queryDto.sortBy]: queryDto.sortDirection },
  //     })
  //       .skip((queryDto.pageNumber - 1) * queryDto.pageSize)
  //       .limit(queryDto.pageSize)
  //       .exec();
  //
  //     //сначала получим id комментов
  //     const commentsIds = items.map((comments) => comments.id);
  //
  //     //получим статусы для юзера
  //     const myStatusesForComments = await this.getLikesByUser(
  //       commentsIds,
  //       userId,
  //     );
  //
  //     const itemsForPaginator = items.map((comment) =>
  //       this.commentOutputModelMapper(
  //         comment,
  //         myStatusesForComments[comment._id.toString()]?.statusLike,
  //       ),
  //     );
  //
  //     const countComments =
  //       await this.CommentModel.countDocuments(filterByPostID);
  //
  //     return this.paginationCommentModelMapper(
  //       queryDto,
  //       countComments,
  //       itemsForPaginator,
  //     );
  //   }
  //
  //   async findCommentById(id: string): Promise<CommentSQL | null> {
  //     const query = `
  //     SELECT id, "userName" as login, email, "createdAt"
  //         FROM public."Users"
  //         WHERE id = $1;
  //     `;
  //
  //     const res = await this.dataSource.query(query, [id]);
  //
  //     if (res.length === 0) return null;
  //
  //     return res.map((e) => {
  //       return {
  //         ...e,
  //       };
  //     })[0];
  //   }
  //
  //   async findForOutput(id: string) {
  //     const foundComment = await this.findCommentById(id);
  //     if (!foundComment) {
  //       return null;
  //     }
  //     return this.commentOutputModelMapper(foundComment, undefined);
  //   }
  //
  //   async findCommentWithLikesForOutput(id: string, userId: string | null) {
  //     const foundComment = await this.findCommentById(id);
  //     if (!foundComment) {
  //       return null;
  //     }
  //
  //     const myLike = await this.getLikesInfo(id.toString(), userId);
  //     return this.commentOutputModelMapper(foundComment, myLike);
  //   }
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
