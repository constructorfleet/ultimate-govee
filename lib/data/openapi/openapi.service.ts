import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { MqttService, Optional } from '~ultimate-govee-common';
import { GoveeDeviceStatus } from '../govee-device';
import { BaseRequest, goveeAPIKeyHeaders, request, Request } from '../utils';
import {
  DeviceListResponse,
  OpenAPIDevice,
} from './models/device-list.response';
import { OpenAPIDeviceScenesResponse } from './models/device-scenes.response';
import {
  DeviceStateResponse,
  OpenAPIDeviceState,
} from './models/device-state.response';
import { MqttDeviceCapability } from './models/mqtt-message';
import { OpenAPIMqttPacket } from './openapi.models';
import { OpenAPIConfigProvider } from './openapi.providers';
import { OpenAPIConfig, OpenAPIMqttMessageHandler } from './openapi.types';
import { plainToInstance } from 'class-transformer';

export type OnOpenAPIMqttMessageCallback = (
  message: GoveeDeviceStatus,
) => Promise<void>;

@Injectable()
export class OpenAPIService implements OpenAPIMqttMessageHandler {
  private readonly logger: Logger = new Logger(OpenAPIService.name);
  private messageCallback: Optional<OnOpenAPIMqttMessageCallback>;
  private apiKey: string | undefined;

  private static findState<T>(
    capabilities: MqttDeviceCapability[],
    capabilityInstance: string,
    stateName: string,
  ): T | undefined {
    return capabilities
      .find((cap) => cap.instance === capabilityInstance)
      ?.state?.find((s) => s.name === stateName)?.value as T;
  }

  static deserializeMqttMessage(payload: string | Buffer): OpenAPIMqttPacket {
    return plainToInstance(OpenAPIMqttPacket, payload);
  }

  private static parseMqttMessage(
    message: OpenAPIMqttPacket,
  ): GoveeDeviceStatus {
    const lackWater = OpenAPIService.findState<number>(
      message.capabilities,
      'lackWaterEvent',
      'Lack',
    );
    const presence = OpenAPIService.findState<number>(
      message.capabilities,
      'bodyAppearedEvent',
      'Presence',
    );
    const absence = OpenAPIService.findState<number>(
      message.capabilities,
      'bodyAppearedEvent',
      'Absence',
    );
    // const motion = OpenAPIService.findState<number>(message.capabilities, 'bodyAppearedEvent', 'Presence');
    const result: GoveeDeviceStatus = {
      id: message.deviceId,
      model: message.model,
      pactCode: 0,
      pactType: 0,
      cmd: 'status',
      state: {
        waterShortage: lackWater !== undefined ? lackWater === 1 : undefined,
        presence:
          presence !== undefined
            ? true
            : absence !== undefined
              ? false
              : undefined,
      },
    };
    return result;
  }

  constructor(
    @Inject(OpenAPIConfigProvider.provide)
    private config: OpenAPIConfig,
    private readonly mqtt: MqttService<OpenAPIMqttPacket>,
  ) {}

  async handle(message: OpenAPIMqttPacket, topic?: string): Promise<void> {
    if (this.messageCallback === undefined) {
      return;
    }
    this.logger.debug(`Received MQTT message on topic ${topic}`);
    await this.messageCallback(OpenAPIService.parseMqttMessage(message));
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  setMqttCallback(callback: OnOpenAPIMqttMessageCallback) {
    this.messageCallback = callback;
  }

  async sendMessage(topic: string, message: Buffer) {
    await this.mqtt.publish(topic, message);
  }

  private request<PayloadType extends BaseRequest = BaseRequest>(
    url: string,
    headers: Record<string, string> = {},
    payload: PayloadType | undefined = undefined,
  ): Request<PayloadType> | undefined {
    if (!this.apiKey) {
      return;
    }
    return request<PayloadType>(
      url,
      { ...headers, ...goveeAPIKeyHeaders(this.apiKey) },
      payload,
    );
  }

  async connect() {
    if (!this.apiKey) {
      return;
    }

    await this.mqtt.connect(
      {
        username: this.apiKey,
        password: this.apiKey,
        clientId: this.apiKey,
      },
      this,
    );
  }

  async disconnect() {
    if (!this.mqtt) {
      return;
    }
    await this.mqtt.disconnect();
  }

  async getDevices(): Promise<OpenAPIDevice[]> {
    try {
      const response = await this.request(this.config.deviceListUrl)?.get(
        DeviceListResponse,
      );
      if (!response?.data) {
        return [];
      }
      return (response.data as DeviceListResponse).devices;
    } catch (error) {
      throw new Error('Unable to retreive devices from OpenAPI');
    }
  }

  async getDevice(
    deviceId: string,
    model: string,
    commandId: string = uuidv4(),
  ): Promise<OpenAPIDeviceState | undefined> {
    try {
      const response = await this.request(
        this.config.deviceStateUrl,
        {},
        {
          requestId: commandId,
          payload: {
            sku: model,
            device: deviceId,
          },
        },
      )?.post(DeviceStateResponse);
      if (!response?.data) {
        return undefined;
      }
      return (response.data as DeviceStateResponse).device;
    } catch (error) {
      // this.logger.error(`Unable to retrieve device from OpenAPI: ${error}`);
      throw new Error('Unable to retreive device from OpenAPI');
    }
  }

  async getScenes(
    deviceId: string,
    model: string,
  ): Promise<OpenAPIDevice | undefined> {
    try {
      const response = await this.request(
        this.config.deviceLightScenesUrl,
        {},
        {
          requestId: uuidv4(),
          payload: {
            sku: model,
            device: deviceId,
          },
        },
      )?.post(OpenAPIDeviceScenesResponse);
      if (!response?.data) {
        return undefined;
      }
      return (response.data as OpenAPIDeviceScenesResponse).payload;
    } catch (error) {
      throw new Error('Unable to retreive scenes from OpenAPI');
    }
  }

  async getDIYScenes(
    deviceId: string,
    model: string,
  ): Promise<OpenAPIDevice | undefined> {
    try {
      const response = await this.request(
        this.config.deviceDIYScenesUrl,
        {},
        {
          requestId: uuidv4(),
          payload: {
            sku: model,
            device: deviceId,
          },
        },
      )?.post(OpenAPIDeviceScenesResponse);
      if (!response?.data) {
        return undefined;
      }
      return (response.data as OpenAPIDeviceScenesResponse).payload;
    } catch (error) {
      throw new Error('Unable to retreive diy scenes from OpenAPI');
    }
  }
}
