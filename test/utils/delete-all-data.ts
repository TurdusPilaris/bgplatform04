import { Connection } from 'mongoose';

export const deleteAllData = async (databaseConnection: Connection) => {
  await databaseConnection.collection('users').deleteMany({});
  await databaseConnection.collection('blogs').deleteMany({});
  await databaseConnection.collection('posts').deleteMany({});
  await databaseConnection.collection('comments').deleteMany({});
};
