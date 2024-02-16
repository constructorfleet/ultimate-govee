import { Expose, Type } from 'class-transformer';
import { OpenAPIResponse } from '../openapi.models';
import { OpenAPIDevice } from './device-list.response';

export class OpenAPIDeviceScenesResponse extends OpenAPIResponse {
  @Expose({ name: 'payload' })
  @Type(() => OpenAPIDevice)
  payload!: OpenAPIDevice;
}
