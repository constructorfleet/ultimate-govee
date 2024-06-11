import { Expose, Type } from 'class-transformer';

export class OpenAPIControlCapability {
  @Expose({ name: 'type' })
  type!: string;

  @Expose({ name: 'instance' })
  instance!: string;

  @Expose({ name: 'value' })
  value!: Record<string, unknown>;
}

export class OpenAPIControlDevice {
  @Expose({ name: 'sku' })
  sku!: string;

  @Expose({ name: 'device' })
  device!: string;

  @Expose({ name: 'capability' })
  @Type(() => OpenAPIControlCapability)
  capability!: OpenAPIControlCapability;
}

export class OpenAPIControlDeviceRequest {
  @Expose({ name: 'requestId' })
  requestId!: string;

  @Expose({ name: 'payload' })
  @Type(() => OpenAPIControlDevice)
  payload!: OpenAPIControlDevice;
}
