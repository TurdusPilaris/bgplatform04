import { Injectable, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostClass,
  PostDocument,
  PostModelType,
} from '../domain/entiities/post.entity';
import { QueryPostInputModel } from '../api/models/input/query-post.model';
import { PostOutputModelMapper } from '../api/models/output/post.output.model';
import { PaginationPostModelMapper } from '../api/models/output/pagination-post.model';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(PostClass.name)
    private PostModel: PostModelType,
  ) {}
  async findAll(queryDto: QueryPostInputModel, blogId?: string) {
    const filter = !blogId ? {} : { blogId: blogId };
    const items = await this.PostModel.find(filter, null, {
      sort: { [queryDto.sortBy]: queryDto.sortDirection },
    })
      .skip((queryDto.pageNumber - 1) * queryDto.pageSize)
      .limit(queryDto.pageSize)
      .exec();

    const itemsForPaginator = items.map(PostOutputModelMapper);

    const countPosts = await this.PostModel.countDocuments(filter);

    return PaginationPostModelMapper(queryDto, countPosts, itemsForPaginator);
  }

  async findById(postId: string) {
    const post = await this.PostModel.findById(postId, { __v: false });
    if (!post) return null;
    return PostOutputModelMapper(post);
  }
}
