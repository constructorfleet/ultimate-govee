import { Expose, plainToInstance } from 'class-transformer';
import { BaseResponse } from '../utils/request.util';
import { GoveeDeviceStatus } from '~ultimate-govee-data';

export class OpenAPIResponse extends BaseResponse {
  @Expose({ name: 'code' })
  code?: number;
}

export class OpenAPIMqttCapabilityState {
  @Expose({ name: 'name' })
  name!: string;

  @Expose({ name: 'value' })
  value!: number;

  @Expose({ name: 'message' })
  message?: string;
}

export class OpenAPIMqttCapability {
  @Expose({ name: 'type' })
  type!: string;
  @Expose({ name: 'instance' })
  instance!: string;
  @Expose({ name: 'state' })
  state!: OpenAPIMqttCapabilityState[];
}

export class OpenAPIMqttPacket {
  @Expose({ name: 'sku' })
  model!: string;
  @Expose({ name: 'device' })
  deviceId!: string;
  @Expose({ name: 'deviceName' })
  deviceName!: string;
  @Expose({ name: 'capabilities' })
  capabilities!: OpenAPIMqttCapability[];
}

export abstract class MqttMessageHandler {
  static deserializeMessage(message: string | Buffer): OpenAPIMqttPacket {
    const json = JSON.parse(
      typeof message === 'string' ? message : message.toString(),
    );
    return plainToInstance(OpenAPIMqttPacket, json);
  }

  static parseMessage(message: OpenAPIMqttPacket): GoveeDeviceStatus {
    const state: GoveeDeviceStatus['state'] = {};
    switch (message.capabilities.at(0)?.instance) {
      case 'bodyAppearedEvent':
        state.presence = true;
        break;
      case 'lackWaterEvent':
        state.waterShortage = true;
        break;
      case 'bodyLeftEvent':
        state.presence = false;
        break;
      default:
        break;
    }
    return {
      id: message.deviceId,
      model: message.model,
      pactCode: 0,
      pactType: 0,
      state,
    };
  }
}
