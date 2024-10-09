import { Injectable, UseGuards } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { BlogCreateInputModel } from '../api/models/input/create-blog.input.model';
import { BlogOutputModelMapper } from '../api/models/output/blog.output.model';
import { InterlayerNotice } from '../../../base/models/Interlayer';
import { AuthBasicGuard } from '../../../infrastructure/guards/auth.basic.guard';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}
}
