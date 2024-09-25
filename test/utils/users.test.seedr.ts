export const userTestSeeder = {
  createUserDTO() {
    return {
      login: 'test',
      email: 'test@email.com',
      password: '1234567',
    };
  },
  createUserDTOInvalidPassword() {
    return {
      login: 'testInvPas',
      email: 'testInvalidPassword@email.com',
      password: '12',
    };
  },
};
