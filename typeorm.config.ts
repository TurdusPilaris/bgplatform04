import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { BlogSQL } from './src/features/bloggers-platform/blogs/domain/entiities/blog.sql.entity';
import { PostSQL } from './src/features/bloggers-platform/posts/domain/entiities/post.sql.entity';
import { CommentSQL } from './src/features/bloggers-platform/comments/domain/entities/comment.sql.entity';
import { LikeForCommentSQL } from './src/features/bloggers-platform/likes/domain/entities/tor/likeForComment';
import { LikeForPostSQL } from './src/features/bloggers-platform/likes/domain/entities/tor/likeForPost';
import { UserSQL } from './src/features/user-accaunts/users/domain/entities/user.sql.entity';
import { SessionSQL } from './src/features/user-accaunts/security/domain/session.sql';
import { Player } from './src/features/quizeGame/domain/entities/player.entity';
import { GameQuestion } from './src/features/quizeGame/domain/entities/game.question.entity';
import { Question } from './src/features/quizeGame/domain/entities/question.entity';
import { Game } from './src/features/quizeGame/domain/entities/game.entity';
import { Answer } from './src/features/quizeGame/domain/entities/answer.entity';

config();

export default new DataSource({
  database: process.env.POSTGRES_DB_NAME,
  host: '127.0.0.1',
  port: 5432,
  type: 'postgres',
  username: 'nodejs',
  password: 'nodejs',
  migrations: ['src/migrations/*.ts'],
  // entities: ['src/features/**/*.entity.ts'],
  entities: [
    BlogSQL,
    PostSQL,
    CommentSQL,
    LikeForCommentSQL,
    LikeForPostSQL,
    UserSQL,
    SessionSQL,
    Answer,
    Game,
    GameQuestion,
    Player,
    Question,
  ],
  synchronize: false,
});
