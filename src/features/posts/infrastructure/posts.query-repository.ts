import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostClass, PostModelType } from '../domain/entiities/post.entity';
import { QueryPostInputModel } from '../api/models/input/query-post.model';
import { PostOutputModelMapper } from '../api/models/output/post.output.model';
import { PaginationPostModelMapper } from '../api/models/output/pagination-post.model';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query-repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    protected commentsQueryRepository: CommentsQueryRepository,
    @InjectModel(PostClass.name)
    private PostModel: PostModelType,
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

    const myStatusesForPosts =
      await this.commentsQueryRepository.getLikesByUser(postIds, userId);

    const itemsForPaginator = items.map((post) =>
      PostOutputModelMapper(
        post,
        myStatusesForPosts[post.id.toString()]?.statusLike,
      ),
    );

    // PostOutputModelMapper, likeStatus.None);

    const countPosts = await this.PostModel.countDocuments(filter);

    return PaginationPostModelMapper(queryDto, countPosts, itemsForPaginator);
  }

  async findById(postId: string, userId) {
    const post = await this.PostModel.findById(postId, { __v: false });
    if (!post) return null;

    const myLike = await this.commentsQueryRepository.getLikesInfo(
      postId,
      userId,
    );
    return PostOutputModelMapper(post, myLike);
  }
}
