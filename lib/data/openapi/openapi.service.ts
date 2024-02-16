import { plainToInstance } from 'class-transformer';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { connect as createMqttClient, MqttClient } from 'mqtt';
import { v4 as uuidv4 } from 'uuid';
import {
  DeviceListResponse,
  OpenAPIDevice,
} from './models/device-list.response';
import { DeviceStateResponse } from './models/device-state.response';
import { OpenAPIDeviceScenesResponse } from './models/device-scenes.response';
import { OpenAPIMessage } from './models/mqtt-message';
import { OpenAPIConfig } from './openapi.config';
import { BaseRequest, request, Request } from '../utils';

@Injectable()
export class OpenAPIService {
  private readonly logger: Logger = new Logger(OpenAPIService.name);
  private readonly mqttClient: MqttClient;

  constructor(
    @Inject(OpenAPIConfig.provide) private readonly config: OpenAPIConfig,
  ) {
    this.mqttClient = createMqttClient(this.config.mqttBrokerUrl, {
      clean: true,
      username: this.config.apiKey,
      password: this.config.apiKey,
    });
    this.mqttClient.on('connect', this.onConnect.bind(this));
  }

  onConnect() {
    this.mqttClient.on('message', this.onMessage.bind(this));
    this.mqttClient.subscribe(`GA/${this.config.apiKey}`);
  }

  onMessage(topic: string, payload: Buffer) {
    const message = plainToInstance(OpenAPIMessage, payload.toString());
    this.config.messageHandler(topic, message, payload);
  }

  private request<PayloadType extends BaseRequest = BaseRequest>(
    url: string,
    headers: Record<string, string> = {},
    payload: PayloadType | undefined = undefined,
  ): Request<PayloadType> {
    return request<PayloadType>(
      url,
      { ...headers, ...this.config.headers(this.config.apiKey) },
      payload,
    );
  }

  async getDevices(): Promise<OpenAPIDevice[]> {
    try {
      const response = await this.request(this.config.deviceListUrl).get(
        DeviceListResponse,
      );
      return (response.data as DeviceListResponse).devices;
    } catch (error) {
      // this.logger.error(`Unable to retrieve devices from OpenAPI: ${error}`);
      throw new Error('Unable to retreive devices from OpenAPI');
    }
  }

  async getDevice(deviceId: string, model: string): Promise<OpenAPIDevice> {
    try {
      const response = await this.request(
        this.config.deviceStateUrl,
        {},
        {
          requestId: uuidv4(),
          payload: {
            sku: model,
            device: deviceId,
          },
        },
      ).post(DeviceStateResponse);
      return (response.data as DeviceStateResponse).device;
    } catch (error) {
      // this.logger.error(`Unable to retrieve device from OpenAPI: ${error}`);
      throw new Error('Unable to retreive device from OpenAPI');
    }
  }

  async getScenes(deviceId: string, model: string): Promise<OpenAPIDevice> {
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
      ).post(OpenAPIDeviceScenesResponse);
      return (response.data as OpenAPIDeviceScenesResponse).payload;
    } catch (error) {
      // this.logger.error(`Unable to retrieve scenes from OpenAPI: ${error}`);
      throw new Error('Unable to retreive scenes from OpenAPI');
    }
  }

  async getDIYScenes(deviceId: string, model: string): Promise<OpenAPIDevice> {
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
      ).post(OpenAPIDeviceScenesResponse);
      return (response.data as OpenAPIDeviceScenesResponse).payload;
    } catch (error) {
      // this.logger.error(`Unable to retrieve diy scenes from OpenAPI: ${error}`);
      throw new Error('Unable to retreive diy scenes from OpenAPI');
    }
  }
}
