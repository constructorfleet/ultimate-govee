import { Expose } from 'class-transformer';
import { BaseResponse } from '../utils/request.util';

export class OpenAPIResponse extends BaseResponse {
  @Expose({ name: 'code' })
  code?: number;
}
