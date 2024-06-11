import { Expose, Type } from 'class-transformer';
import { OpenAPIResponse } from '../openapi.models';
import {
  OpenAPICapabilities,
  OpenAPIDeviceCapability,
} from './device-capabilities';

export class OpenAPIDevice {
  @Expose({ name: 'sku' })
  model!: string;

  @Expose({ name: 'device' })
  deviceId!: string;

  @Expose({ name: 'capabilities' })
  @Type(() => OpenAPIDeviceCapability)
  capabilities!: OpenAPIDeviceCapability<OpenAPICapabilities>[];
}

export class OpenAPIDeviceListResponse extends OpenAPIResponse {
  @Expose({ name: 'data' })
  @Type(() => OpenAPIDevice)
  devices!: OpenAPIDevice[];
}
