import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  @Delete('all-data')
  @HttpCode(204)
  async allDelete() {
    //truncate blogs
    const queryForBlogs = `TRUNCATE TABLE public."Blogs" CASCADE`;
    await this.dataSource.query(queryForBlogs);
    //truncate likes
    const queryForLikesPosts = `TRUNCATE TABLE public."LikeForPost" CASCADE`;
    await this.dataSource.query(queryForLikesPosts);
    const queryForLikeForComment = `TRUNCATE TABLE public."LikeForComment" CASCADE`;
    await this.dataSource.query(queryForLikeForComment);
    //truncate devices
    const queryForDevices = `TRUNCATE TABLE public."DeviceAuthSession" CASCADE`;
    await this.dataSource.query(queryForDevices);
    //truncate users
    const queryForUsers = `TRUNCATE TABLE public."Users" CASCADE`;
    await this.dataSource.query(queryForUsers);
    //truncate "Comments"
    const queryForComments = `TRUNCATE TABLE public."Comments" CASCADE`;
    await this.dataSource.query(queryForComments);
    //truncate "Posts"
    const queryForPosts = `TRUNCATE TABLE public."Posts" CASCADE`;
    await this.dataSource.query(queryForPosts);
  }
}
