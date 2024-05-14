import { BlogDocument } from '../../../domain/entiities/blog.entity';

export class BlogOutputModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}

export const BlogOutputModelMapper = (blog: BlogDocument): BlogOutputModel => {
  const outputBlogModel = new BlogOutputModel();
  outputBlogModel.id = blog.id;
  outputBlogModel.name = blog.name;
  outputBlogModel.description = blog.description;
  outputBlogModel.websiteUrl = blog.websiteUrl;
  outputBlogModel.createdAt = blog.createdAt.toISOString();
  outputBlogModel.isMembership = blog.isMembership;

  return outputBlogModel;
};
