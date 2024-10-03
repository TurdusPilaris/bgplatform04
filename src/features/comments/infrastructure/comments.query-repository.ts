import { Injectable } from '@nestjs/common';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/entities/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { QueryCommentModel } from '../api/model/input/query-comment.model';
import {
  PaginationCommentModel,
  PaginationCommentModelMapper,
} from '../api/model/output/pagination-comment.model';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { CommentOutputModelMapper } from '../api/model/output/comment.output.model';
import { likeStatus } from '../../../base/models/likesStatus';
import { Like, LikeModelType } from '../domain/entities/like.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    protected postsRepository: PostsRepository,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
  ) {}

  async findAll(queryDto: QueryCommentModel, postId: string) {
    // : Promise<PaginationCommentModel>
    const filterByPostID = { postId: postId };
    const items = await this.CommentModel.find(filterByPostID, null, {
      sort: { [queryDto.sortBy]: queryDto.sortDirection },
    })
      .skip((queryDto.pageNumber - 1) * queryDto.pageSize)
      .limit(queryDto.pageSize)
      .exec();

    console.log('items', items);

    const itemsForPaginator = items.map((comment) =>
      CommentOutputModelMapper(comment, likeStatus.None),
    );

    console.log('itemsForPaginator', itemsForPaginator);
    // const itemsForPaginator = items.map(
    //   CommentOutputModelMapper(likeStatus.None),
    // );

    const countComments =
      await this.CommentModel.countDocuments(filterByPostID);

    return PaginationCommentModelMapper(
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
}
