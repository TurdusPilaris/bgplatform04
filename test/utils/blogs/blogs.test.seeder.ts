import { BlogCreateInputModel } from '../../../src/features/bloggers-platform/blogs/api/models/input/create-blog.input.model';
import { CreatePostWithoutBlogIdInputModel } from '../../../src/features/bloggers-platform/posts/api/models/input/create-post-withoutBlogId.input.model';

export const blogsTestSeeder = {
  createBlogDTO(): BlogCreateInputModel {
    return {
      name: 'testBlog',
      description: 'This is really big description',
      websiteUrl: 'https://blablablablabla.com',
    };
  },

  createUserDTOInvalidPassword() {
    return {
      login: 'testInvPas',
      email: 'testInvalidPassword@email.com',
      password: '12',
    };
  },

  createArrayBlogDTO(count: number) {
    const blogs = [];
    for (let i = 0; i < count; i++) {
      blogs.push({
        name: 'test' + i,
        description: 'this is test description' + i,
        websiteUrl: `https://blablablablablatest${i}.com`,
      });
    }
    return blogs;
  },

  createPostWithoutBlogIdDTO(): CreatePostWithoutBlogIdInputModel {
    return {
      title: 'this is new test post',
      shortDescription: 'This is really big description',
      content: 'this is test content',
    };
  },
};
