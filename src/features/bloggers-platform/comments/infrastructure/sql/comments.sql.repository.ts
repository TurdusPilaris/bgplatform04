import { DataSource } from 'typeorm';
import { CommentSQL } from '../../api/model/sql/comment.model.sql';

export class CommentsSqlRepository {
  constructor(protected dataSource: DataSource) {}

  async createComment(comment: string, postId: string, userId: string) {
    const query = `
    INSERT INTO public."Comments"(
        "postId", "commentatorId", content, "createdAt")
        VALUES ( $1, $2, $3, $4) RETURNING id;
    `;

    const res = await this.dataSource.query(query, [
      postId,
      userId,
      comment,
      new Date(),
    ]);

    return res[0].id;
  }

  async findCommentById(id: string): Promise<CommentSQL | null> {
    const query = `
      SELECT "Comments".id, "Comments"."postId", "Comments"."commentatorId", "Comments".content, "Comments"."createdAt", "Users"."userName" as "commentatorName"
        FROM public."Comments"
        LEFT JOIN "Users" ON "Users".id = "Comments"."commentatorId"
        WHERE "Comments".id = $1;
      `;

    const res: CommentSQL[] = await this.dataSource.query(query, [id]);

    if (res.length === 0) return null;

    return res[0];
  }

  async updateComment(commentId: string, content: string) {
    const query = `
    UPDATE public."Comments"
        SET content= $2
        WHERE id = $1;
    `;

    await this.dataSource.query(query, [commentId, content]);
  }

  async deleteComment(commentId: string) {
    const query = `
    DELETE FROM public."Comments"
        WHERE id = $1;
    `;

    await this.dataSource.query(query, [commentId]);
  }
}
