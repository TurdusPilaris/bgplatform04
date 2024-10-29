import { InterlayerNoticeExtension } from './Interlayer';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export class ErrorProcessor {
  public extensions: InterlayerNoticeExtension[];
  public code = 0;
  constructor(code: number, extensions: InterlayerNoticeExtension[]) {
    this.code = code;
    this.extensions = extensions;
  }

  public errorHandling() {
    console.log('this-------------', this);
    if (this.code === 400) {
      console.log('Im here');
      throw new BadRequestException(this.extensions);
    }
    if (this.code === 401) {
      throw new UnauthorizedException();
    }
    if (this.code === 403) {
      throw new ForbiddenException();
    }
    if (this.code === 404) {
      throw new NotFoundException();
    }
  }
}
