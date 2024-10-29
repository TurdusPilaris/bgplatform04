import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cat, CatDocument, CatModelType } from './entities/users-schema';

@Injectable()
export class CatsRepository {
  constructor(
    @InjectModel(Cat.name)
    private CatModel: CatModelType,
  ) {}

  async create(createCatDto: any): Promise<Cat> {
    const superCat = this.CatModel.createSuperCat(createCatDto, this.CatModel);
    return superCat.save();
  }

  async findAll(): Promise<CatDocument[]> {
    return this.CatModel.find().exec();
  }

  async save(cat: CatDocument) {
    await cat.save();
  }
}
