import { Expose, Type } from 'class-transformer';

export class OpenAPIMqttDeviceState {
  @Expose({ name: 'name' })
  name!: string;

  @Expose({ name: 'value' })
  value!: number;

  @Expose({ name: 'message' })
  message?: string;
}

export class OpenAPIMqttDeviceCapability {
  @Expose({ name: 'type' })
  type!: string;

  @Expose({ name: 'instance' })
  instance!: string;

  @Expose({ name: 'state' })
  @Type(() => OpenAPIMqttDeviceState)
  state!: OpenAPIMqttDeviceState[];
}

export class OpenAPIMqttMessage {
  @Expose({ name: 'sku' })
  model!: string;

  @Expose({ name: 'device' })
  deviceId!: string;

  @Expose({ name: 'deviceName' })
  deviceName!: string;

  @Expose({ name: 'capabilities' })
  @Type(() => OpenAPIMqttDeviceCapability)
  capabilities!: OpenAPIMqttDeviceCapability[];
}
