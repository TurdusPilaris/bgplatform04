import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentSQL } from '../../domain/entities/comment.sql.entity';

export class CommentsTorRepository {
  constructor(
    protected dataSource: DataSource,
    @InjectRepository(CommentSQL)
    private readonly commentsRepository: Repository<CommentSQL>,
  ) {}

  async createComment(comment: CommentSQL) {
    const createdComment = await this.commentsRepository.save(comment);
    return createdComment.id;
  }

  async findCommentById(id: string): Promise<CommentSQL | null> {
    const foundComment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!foundComment) return null;
    return foundComment;
  }

  async updateComment(id: string, content: string) {
    await this.commentsRepository.update({ id: id }, { content: content });
  }

  async deleteComment(id: string) {
    await this.commentsRepository.delete(id);
  }
}
