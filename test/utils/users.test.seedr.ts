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
