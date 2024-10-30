import { UserDocument } from '../../../domain/entities/user.entity';
import { AboutMeOutputModel } from '../../../../auth/api/models/output/about-me-output-model';

export class UserOutputModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}

// MAPPERS
