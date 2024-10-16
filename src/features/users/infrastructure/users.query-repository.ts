import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/entities/user.entity';
import { Injectable } from '@nestjs/common';
import {
  AboutMeOutputModelMapper,
  UserOutputModel,
  UserOutputModelMapper,
} from '../api/models/output/user.output.model';
import { QueryUserInputModel } from '../api/models/input/query-user.input.model';
import {
  PaginationUserModel,
  PaginationUserOutputModelMapper,
} from '../api/models/output/pagination-user.model';
import { AboutMeOutputModel } from '../../auth/api/models/output/about-me-output-model';
import { InterlayerNotice } from '../../../base/models/Interlayer';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  async findById(id: string): Promise<UserOutputModel | null> {
    const user = await this.UserModel.findById(id, { __v: false });

    if (!user) return null;
    return UserOutputModelMapper(user);
  }

  async findAll(queryDto: QueryUserInputModel): Promise<PaginationUserModel> {
    const filterLogin = {
      'accountData.userName': {
        $regex: queryDto.searchLoginTerm ?? '',
        $options: 'i',
      },
    };

    const filterEmail = {
      'accountData.email': {
        $regex: queryDto.searchEmailTerm ?? '',
        $options: 'i',
      },
    };

    const arrayOfFilter: any[] = [];

    if (queryDto.searchEmailTerm) {
      arrayOfFilter.push(filterEmail);
    }
    if (queryDto.searchLoginTerm) {
      arrayOfFilter.push(filterLogin);
    }

    const filterLoginOrEmail =
      arrayOfFilter.length === 0
        ? {}
        : {
            $or: arrayOfFilter,
          };

    let sortBy = queryDto.sortBy;
    if (queryDto.sortBy === 'login' || queryDto.sortBy === 'name') {
      sortBy = 'accountData.userName';
    }
    if (queryDto.sortBy === 'email') {
      sortBy = 'accountData.email';
    }

    if (queryDto.sortBy === 'createdAt') {
      sortBy = 'accountData.createdAt';
    }

    const items = await this.UserModel.find(filterLoginOrEmail, null, {
      sort: { [sortBy]: queryDto.sortDirection },
    })
      .skip((queryDto.pageNumber - 1) * queryDto.pageSize)
      .limit(queryDto.pageSize)
      .exec();

    const itemsForPaginator = items.map(UserOutputModelMapper);
    const countUsers = await this.UserModel.countDocuments(filterLoginOrEmail);

    return PaginationUserOutputModelMapper(
      queryDto,
      countUsers,
      itemsForPaginator,
    );
  }

  async getAboutMe(
    userId: string | null,
  ): Promise<InterlayerNotice<AboutMeOutputModel | null>> {
    if (!userId) {
      const result = new InterlayerNotice(null);
      result.addError('User is not found', 'userId', 400);
      return result;
    }
    const user = await this.findById(userId);

    if (!user) {
      const result = new InterlayerNotice(null);
      result.addError('User is not found', 'userId', 400);
      return result;
    }

    return new InterlayerNotice(AboutMeOutputModelMapper(user));
  }
}
