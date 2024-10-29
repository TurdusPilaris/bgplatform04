import { Injectable } from '@nestjs/common';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/entities/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { QueryCommentModel } from '../api/model/input/query-comment.model';
import { paginationCommentModelMapper } from '../api/model/output/pagination-comment.model';
import { CommentOutputModelMapper } from '../api/model/output/comment.output.model';
import { Like, LikeModelType } from '../domain/entities/like.entity';
import { likeStatus } from '../../../../base/models/likesStatus';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
  ) {}

  async findAll(
    queryDto: QueryCommentModel,
    postId: string,
    userId: string | null,
  ) {
    // : Promise<PaginationCommentModel>
    const filterByPostID = { postId: postId };
    const items = await this.CommentModel.find(filterByPostID, null, {
      sort: { [queryDto.sortBy]: queryDto.sortDirection },
    })
      .skip((queryDto.pageNumber - 1) * queryDto.pageSize)
      .limit(queryDto.pageSize)
      .exec();

    //сначала получим id комментов
    const commentsIds = items.map((comments) => comments.id);

    //получим статусы для юзера
    const myStatusesForComments = await this.getLikesByUser(
      commentsIds,
      userId,
    );

    const itemsForPaginator = items.map((comment) =>
      CommentOutputModelMapper(
        comment,
        myStatusesForComments[comment._id.toString()]?.statusLike,
      ),
    );

    const countComments =
      await this.CommentModel.countDocuments(filterByPostID);

    return paginationCommentModelMapper(
      queryDto,
      countComments,
      itemsForPaginator,
    );
  }

  async findCommentById(id: string): Promise<CommentDocument | null> {
    return this.CommentModel.findById(id);
  }

  async findForOutput(id: string) {
    const foundComment = await this.findCommentById(id);
    if (!foundComment) {
      return null;
    }
    return CommentOutputModelMapper(foundComment, undefined);
  }

  async findCommentWithLikesForOutput(id: string, userId: string | null) {
    const foundComment = await this.findCommentById(id);
    if (!foundComment) {
      return null;
    }

    const myLike = await this.getLikesInfo(id.toString(), userId);
    return CommentOutputModelMapper(foundComment, myLike);
  }

  async getLikesInfo(
    parentId: string,
    userId: string | null,
  ): Promise<likeStatus> {
    if (userId) {
      const myLike = await this.LikeModel.findOne({
        parentID: parentId,
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

  async getLikesByUser(commentsIds: any[], userId: string) {
    const likes = await this.LikeModel.find()
      .where('parentID')
      .in(commentsIds)
      .where('userID')
      .equals(userId)
      .lean();

    const likesWithKeys = likes.reduce((acc, like) => {
      const likecommentID = like.parentID.toString();

      acc[likecommentID] = like;
      return acc;
    }, {});

    return likesWithKeys;
  }
}
