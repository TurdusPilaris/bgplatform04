import { IsBooleanStrict } from '../../../../../../infrastructure/decorators/validate/is-boolean-strict.decorator';
import { ToBoolean } from '../../../../../../infrastructure/decorators/validate/to-boolean';

export class QuestionPublishInputModel {
  @ToBoolean()
  @IsBooleanStrict()
  published: boolean;
}
