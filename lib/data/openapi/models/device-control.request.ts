import { Expose, Type } from 'class-transformer';

export class ControlCapability {
  @Expose({ name: 'type' })
  type!: string;

  @Expose({ name: 'instance' })
  instance!: string;

  @Expose({ name: 'value' })
  value!: Record<string, unknown>;
}

export class ControlDevice {
  @Expose({ name: 'sku' })
  sku!: string;

  @Expose({ name: 'device' })
  device!: string;

  @Expose({ name: 'capability' })
  @Type(() => ControlCapability)
  capability!: ControlCapability;
}

export class ControlDeviceRequest {
  @Expose({ name: 'requestId' })
  requestId!: string;

  @Expose({ name: 'payload' })
  @Type(() => ControlDevice)
  payload!: ControlDevice;
}
