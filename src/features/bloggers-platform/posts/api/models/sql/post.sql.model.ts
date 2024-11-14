import { likeStatus } from '../../../../../../base/models/likesStatus';

export class PostSQL {
  id: string;

  blogId: string;

  blogName: string;

  title: string;

  shortDescription: string;

  content: string;

  createdAt: Date;

  dislikesCount: number;

  likesCount: number;

  myStatus: likeStatus;
}
