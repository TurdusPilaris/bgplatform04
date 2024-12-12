import { Injectable } from '@nestjs/common';
import { PostCreateInputModel } from '../../api/models/input/create-post.input.model';
import { DataSource, Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { PostSQL } from '../../domain/entiities/post.sql.entity';

@Injectable()
export class PostsTorRepository {
  constructor(
    protected dataSource: DataSource,
    @InjectRepository(PostSQL)
    private readonly postsRepository: Repository<PostSQL>,
  ) {}
  async createPost(post: PostSQL): Promise<string> {
    const createdPost = await this.postsRepository.save(post);
    return createdPost.id;
  }

  async update(updateModel: PostCreateInputModel, id: string) {
    await this.postsRepository.update(
      { id: id },
      {
        title: updateModel.title,
        shortDescription: updateModel.shortDescription,
        content: updateModel.content,
      },
    );
  }

  async findById(id: string): Promise<PostSQL | null> {
    const foundPost = await this.postsRepository.findOneBy({ id: id });
    if (!foundPost) return null;
    return foundPost;
  }

  async delete(id: string) {
    await this.postsRepository.delete(id);
  }
}
