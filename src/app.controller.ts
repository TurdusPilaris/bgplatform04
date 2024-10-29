import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';
// import { CatsRepository } from './features/users/domain/cats-repository';
// import { Types } from 'mongoose';

@Controller('app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    // private readonly catsRepository: CatsRepository,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  // @Get('cats')
  // getAllCats() {
  //   return this.catsRepository.findAll();
  // }

  // @Post('cats')
  // createCat(@Body() dto) {
  //   return this.catsRepository.create(dto);
  // }

  // @Put('cats/:id')
  // async updateCat(@Param('id') id: any) {
  //   const cats = await this.catsRepository.findAll();
  //   const targetCat = cats.find((c) => c._id.equals(new Types.ObjectId(id)))!;
  //
  //   targetCat.setAge(5);
  //   this.catsRepository.save(targetCat);
  // }
}
