import { Expose, Type } from 'class-transformer';
import { OpenAPIResponse } from '../openapi.models';
import {
  OpenAPICapabilities,
  OpenAPIDeviceCapabilityState,
} from './device-capabilities';

export class OpenAPIDeviceState {
  @Expose({ name: 'sku' })
  model!: string;

  @Expose({ name: 'device' })
  deviceId!: string;

  @Expose({ name: 'capabilities' })
  @Type(() => OpenAPIDeviceCapabilityState)
  capabilities!: OpenAPIDeviceCapabilityState<OpenAPICapabilities>[];
}

export class OpenAPIDeviceStateResponse extends OpenAPIResponse {
  @Expose({ name: 'payload' })
  @Type(() => OpenAPIDeviceState)
  device!: OpenAPIDeviceState;
}
