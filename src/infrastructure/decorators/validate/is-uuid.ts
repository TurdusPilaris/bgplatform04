import { IsUUID } from 'class-validator';

export class FindItemParams {
  @IsUUID()
  id: string;
}
