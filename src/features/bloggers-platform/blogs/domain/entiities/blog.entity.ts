import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { BlogCreateInputModel } from '../../api/models/input/create-blog.input.model';

export type BlogDocument = HydratedDocument<Blog>;
@Schema()
export class Blog {
  @Prop()
  name: string;
  @Prop()
  description: string;
  @Prop()
  websiteUrl: string;
  @Prop()
  createdAt: Date;
  @Prop()
  isMembership: boolean;

  static createNewBlog(
    dto: BlogCreateInputModel,
    BlogModel: BlogModelType,
  ): BlogDocument {
    const createdBlog = new BlogModel();
    createdBlog.name = dto.name;
    createdBlog.description = dto.description;
    createdBlog.websiteUrl = dto.websiteUrl;
    createdBlog.createdAt = new Date();
    createdBlog.isMembership = false;

    return createdBlog;
  }
}

export type BlogModelStaticType = {
  createNewBlog: (
    dto: BlogCreateInputModel,
    BlogModel: BlogModelType,
  ) => BlogDocument;
};
export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.statics = {
  createNewBlog: Blog.createNewBlog,
} as BlogModelStaticType;

export type BlogModelType = Model<BlogDocument> & BlogModelStaticType;
