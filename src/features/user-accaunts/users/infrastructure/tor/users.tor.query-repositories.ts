import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserOutputModel } from '../../api/models/output/user.output.model';
import { QueryUserInputModel } from '../../api/models/input/query-user.input.model';
import { PaginationOutputModel } from '../../../../../base/models/output/pagination.output.model';
import { AboutMeOutputModel } from '../../../auth/api/models/output/about-me-output-model';
import { UserSQL } from '../../domain/entities/user.sql.entity';

@Injectable()
export class UsersTorQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(UserSQL)
    private readonly usersRepository: Repository<UserSQL>,
  ) {}
  // async onModuleInit() {
  //   console.log(await this.findAll({} as QueryUserInputModel));
  // }
  async findById(id: string): Promise<UserOutputModel | null> {
    const foundUser = await this.usersRepository.findOneBy({ id: id });

    if (!foundUser) return null;

    return this.userOutputModelMapper(foundUser);
  }

  async findAll(queryDto: QueryUserInputModel) {
    // : Promise<PaginationOutputModel<UserOutputModel[]>> {

    const limit = queryDto.pageSize;
    const offset = (queryDto.pageNumber - 1) * queryDto.pageSize;
    const searchLoginTerm = queryDto.searchLoginTerm
      ? `%${queryDto.searchLoginTerm}%`
      : '%%';
    const searchEmailTerm = queryDto.searchEmailTerm
      ? `%${queryDto.searchEmailTerm}%`
      : '%%';
    const sortDirection = (
      queryDto.sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
    ) as 'ASC' | 'DESC'; // Приведение к литеральному типу

    const sortBy =
      queryDto.sortBy === 'login' ? `"userName"` : `"${queryDto.sortBy}"`;

    const builder = this.dataSource
      .getRepository(UserSQL)
      .createQueryBuilder('u')
      .select('u.id')
      .addSelect('u.email')
      .addSelect('u.userName')
      .addSelect('u.createdAt')
      .where(
        'u."userName" ILIKE :searchLoginTerm or u.email ILIKE :searchEmailTerm',
        {
          searchLoginTerm,
          searchEmailTerm,
        },
      )
      .orderBy(sortBy, sortDirection)
      .limit(limit)
      .offset(offset);
    const res = await builder.getMany();

    // console.log('sql', builder.getSql());
    // console.log('result----', res);

    const countUsers = await this.getCountUsersByFilter(
      searchLoginTerm,
      searchEmailTerm,
    );

    const items: UserOutputModel[] = res.map((userTor) => {
      return {
        id: userTor.id,
        login: userTor.userName,
        email: userTor.email,
        createdAt: userTor.createdAt.toISOString(),
      };
    });

    // const items: UserOutputModel[] = res.map((userTor) => {
    //   return {
    //     id: userTor.id,
    //     email: userTor.email,
    //     login: userTor.userName,
    //     createdAt: userTor.createdAt.toISOString(),
    //   };
    // });
    return this.paginationUserOutputModelMapper(queryDto, countUsers, items);
  }

  async getCountUsersByFilter(
    searchLoginTerm: string,
    searchEmailTerm: string,
  ) {
    const result = await this.dataSource
      .getRepository('user_tor')
      .createQueryBuilder('u')
      .select('COUNT(*)', 'u_usersCount')
      .where(
        'u."userName" ILIKE :searchLoginTerm or u.email ILIKE :searchEmailTerm',
        {
          searchLoginTerm,
          searchEmailTerm,
        },
      )
      .getRawOne();

    return +result.u_usersCount;
  }

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

  async getAboutMe(userId: string): Promise<AboutMeOutputModel | null> {
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (!user) return null;
    return this.aboutMeOutputModelMapper(user);
  }
  aboutMeOutputModelMapper = (user: UserSQL): AboutMeOutputModel => {
    return {
      login: user.userName,
      email: user.email,
      userId: user.id,
    };
  };

  userOutputModelMapper = (user: UserSQL): UserOutputModel => {
    return {
      id: user.id,
      login: user.userName,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  };
}
