import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IoTData } from '../api';
import { IoTClient } from './iot.client';
import { IoTMessage } from './models/iot-message';
import { IoTHandler } from './iot.handler';
import { GoveeDeviceStatus } from '../govee-device';
import { unpaddedHexToArray } from '../../common';

const payloadDecoder = new TextDecoder();

const parseMessage = (payload: ArrayBuffer): IoTMessage => {
  const decoded = payloadDecoder.decode(payload);
  const plain = JSON.parse(decoded);
  return plainToInstance(IoTMessage, plain);
};

export type OnMessageCallback = (message: GoveeDeviceStatus) => void;

@Injectable()
export class IoTService implements IoTHandler, OnModuleDestroy {
  private readonly logger: Logger = new Logger(IoTService.name);
  private messageCallback: OnMessageCallback | undefined;

  constructor(private readonly client: IoTClient) {}

  onMessage(topic: string, payload: ArrayBuffer, dup: boolean) {
    const message = parseMessage(payload);
    this.logger.debug(`Received message on topic ${topic}`);
    this.logger.debug(JSON.stringify(message));
    if (!dup && this.messageCallback) {
      this.messageCallback(IoTService.parseIoTMessage(message));
    }
  }

  async connect(iotData: IoTData, callback: OnMessageCallback) {
    this.messageCallback = callback;
    await this.client.create(iotData, this);
  }

  async send(topic: string, payload: string) {
    this.logger.debug(`Sending message to ${topic}, ${payload}`);
    this.client?.publish(topic, payload);
  }

  async onModuleDestroy() {
    await this.client?.disconnect();
  }

  private static parseIoTMessage(message: IoTMessage): GoveeDeviceStatus {
    const code = message.state?.status?.code;
    let humidityCode: number | undefined;
    if (code !== undefined) {
      humidityCode = unpaddedHexToArray(code)?.slice(-1)[0];
    }
    const currentHumditity = message.humidity ? message.humidity : humidityCode;
    return {
      id: message.deviceId,
      model: message.model,
      pactCode: message.pactCode,
      pactType: message.pactType,
      cmd: message.command,
      state: {
        online: message.state?.connected,
        isOn: message.state?.isOn,
        temperature: message.temperature
          ? {
              current: message.temperature,
            }
          : undefined,
        humidity: currentHumditity
          ? {
              current: currentHumditity,
            }
          : undefined,
      },
      op: message.op,
    };
  }
}
