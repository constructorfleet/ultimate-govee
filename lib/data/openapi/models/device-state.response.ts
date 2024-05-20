import { Expose, Type } from 'class-transformer';
import { OpenAPIResponse } from '../openapi.models';
import { Capabilities, DeviceCapabilityState } from './device-capabilities';

export class OpenAPIDeviceState {
  @Expose({ name: 'sku' })
  model!: string;

  @Expose({ name: 'device' })
  deviceId!: string;

  @Expose({ name: 'capabilities' })
  @Type(() => DeviceCapabilityState)
  capabilities!: DeviceCapabilityState<Capabilities>[];
}

export class DeviceStateResponse extends OpenAPIResponse {
  @Expose({ name: 'payload' })
  @Type(() => OpenAPIDeviceState)
  device!: OpenAPIDeviceState;
}
