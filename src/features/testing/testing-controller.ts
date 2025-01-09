import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  @Delete('all-data')
  @HttpCode(204)
  async allDelete() {
    const tables = await this.dataSource.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        `);

    for (const { table_name } of tables) {
      await this.dataSource.query(
        `TRUNCATE TABLE public."${table_name}" CASCADE`,
      );
    }
    // //truncate blogs
    // const queryForBlogs = `TRUNCATE TABLE public."blogs" CASCADE`;
    // await this.dataSource.query(queryForBlogs);
    // //truncate likes
    // const queryForLikesPosts = `TRUNCATE TABLE public."likeForPosts" CASCADE`;
    // await this.dataSource.query(queryForLikesPosts);
    // const queryForLikeForComment = `TRUNCATE TABLE public."likeForComments" CASCADE`;
    // await this.dataSource.query(queryForLikeForComment);
    // //truncate devices
    // const queryForDevices = `TRUNCATE TABLE public."sessions" CASCADE`;
    // await this.dataSource.query(queryForDevices);
    // //truncate users
    // const queryForUsers = `TRUNCATE TABLE public."user_tor" CASCADE`;
    // await this.dataSource.query(queryForUsers);
    // //truncate "Comments"
    // const queryForComments = `TRUNCATE TABLE public."comments" CASCADE`;
    // await this.dataSource.query(queryForComments);
    // // //truncate "Posts"
    // const queryForPosts = `TRUNCATE TABLE public."posts" CASCADE`;
    // await this.dataSource.query(queryForPosts);
  }
}
