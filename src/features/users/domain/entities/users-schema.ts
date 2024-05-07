import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

export type CatDocument = HydratedDocument<Cat>;

@Schema()
export class CatToy {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  price: number;
}

export const CatToySchema = SchemaFactory.createForClass(CatToy);

@Schema()
export class Cat {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  age: number;

  @Prop()
  breed: string;

  @Prop()
  tags: string[];

  @Prop({ default: [], type: [CatToySchema] })
  toys: CatToy[];

  setAge(age: number) {
    if (age < 0) throw new Error('Bad age value');
    this.age = age;
  }

  static createSuperCat(dto: any, CatModel: CatModelType) {
    const createdCat = new CatModel({});
    createdCat.name = dto.name;
    createdCat.setAge(100);
    return createdCat;
  }
}

export type CatModelStaticType = {
  createSuperCat: (dto: any, CatModel: CatModelType) => CatDocument;
};

export const CatSchema = SchemaFactory.createForClass(Cat);
CatSchema.methods = {
  setAge: Cat.prototype.setAge,
};
CatSchema.statics = {
  createSuperCat: Cat.createSuperCat,
} as CatModelStaticType;

export type CatModelType = Model<CatDocument> & CatModelStaticType;
