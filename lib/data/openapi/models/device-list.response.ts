import { Expose, Type } from 'class-transformer';
import { OpenAPIResponse } from '../openapi.models';
import { Capabilities, DeviceCapability } from './device-capabilities';

export class OpenAPIDevice {
  @Expose({ name: 'sku' })
  model!: string;

  @Expose({ name: 'device' })
  deviceId!: string;

  @Expose({ name: 'capabilities' })
  @Type(() => DeviceCapability)
  capabilities!: DeviceCapability<Capabilities>[];
}

export class DeviceListResponse extends OpenAPIResponse {
  @Expose({ name: 'data' })
  @Type(() => OpenAPIDevice)
  devices!: OpenAPIDevice[];
}
