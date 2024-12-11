import { BlogCreateInputModel } from '../../../src/features/bloggers-platform/blogs/api/models/input/create-blog.input.model';

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
  createUserDTOForDelete() {
    return {
      login: 'userDelete',
      email: 'userForDelete@email.com',
      password: '1234567',
    };
  },
  createArrayUserDTO(count: number) {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push({
        login: 'test' + i,
        email: `test${i}@email.com`,
        password: '1234567',
      });
    }
    return users;
  },
};
