import { InjectModel } from '@nestjs/mongoose';
import {
  User,
  UserDocument,
  UserModelType,
} from '../domain/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { UserOutputModel } from '../api/models/output/user.output.model';
import { QueryUserInputModel } from '../api/models/input/query-user.input.model';

import { AboutMeOutputModel } from '../../auth/api/models/output/about-me-output-model';
import { PaginationOutputModel } from '../../../../base/models/output/pagination.output.model';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  async findById(id: string): Promise<UserOutputModel | null> {
    const user = await this.UserModel.findById(id, { __v: false });

    if (!user) return null;
    return this.userOutputModelMapper(user);
  }

  async findAll(
    queryDto: QueryUserInputModel,
  ): Promise<PaginationOutputModel<UserOutputModel[]>> {
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

    const itemsForPaginator = items.map(this.userOutputModelMapper);
    const countUsers = await this.UserModel.countDocuments(filterLoginOrEmail);

    return this.paginationUserOutputModelMapper(
      queryDto,
      countUsers,
      itemsForPaginator,
    );
  }

  async getAboutMe(userId: string): Promise<AboutMeOutputModel> {
    const user = await this.findById(userId);

    return this.aboutMeOutputModelMapper(user);
  }

  userOutputModelMapper = (user: UserDocument): UserOutputModel => {
    return {
      id: user.id,
      login: user.accountData.userName,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt.toISOString(),
    };
  };

  aboutMeOutputModelMapper = (user: UserOutputModel): AboutMeOutputModel => {
    return {
      login: user.login,
      email: user.email,
      userId: user.id,
    };
  };

  paginationUserOutputModelMapper = (
    query: QueryUserInputModel,
    countUsers: number,
    items: UserOutputModel[],
  ): PaginationOutputModel<UserOutputModel[]> => {
    return {
      pagesCount: Math.ceil(countUsers / query.pageSize),
      page: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount: countUsers,
      items: items,
    };
  };
}
