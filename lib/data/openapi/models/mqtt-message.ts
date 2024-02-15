import { Expose, Type } from 'class-transformer';

export class MqttDeviceState {
  @Expose({ name: 'name' })
  name!: string;

  @Expose({ name: 'value' })
  value!: number;

  @Expose({ name: 'message' })
  message?: string;
}

export class MqttDeviceCapability {
  @Expose({ name: 'type' })
  type!: string;

  @Expose({ name: 'instance' })
  iinstance!: string;

  @Expose({ name: 'state' })
  @Type(() => MqttDeviceState)
  state!: MqttDeviceState;
}

export class OpenAPIMessage {
  @Expose({ name: 'sku' })
  model!: string;

  @Expose({ name: 'device' })
  deviceId!: string;

  @Expose({ name: 'deviceName' })
  deviceName!: string;

  @Expose({ name: 'capabilities' })
  @Type(() => MqttDeviceCapability)
  capabilities!: MqttDeviceCapability[];
}
