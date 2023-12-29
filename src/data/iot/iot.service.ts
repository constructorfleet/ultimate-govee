import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { TextDecoder } from 'web-encoding';
import { IoTData } from '../../domain/models/account-client';
import { IoTClient } from './iot.client';
import { IoTMessage } from './models/iot-message';
import { IoTHandler } from './iot.handler';

const payloadDecoder = new TextDecoder();

const parseMessage = (payload: ArrayBuffer): IoTMessage =>
  JSON.parse(payloadDecoder.decode(payload)) as IoTMessage;

export type OnMessageCallback = (message: IoTMessage) => void;

@Injectable()
export class IoTService implements IoTHandler, OnModuleDestroy {
  private readonly logger: Logger = new Logger(IoTService.name);
  private messageCallback: OnMessageCallback | undefined;

  constructor(private readonly client: IoTClient) {}

  onMessage(topic: string, payload: ArrayBuffer, dup: boolean) {
    const message = parseMessage(payload);
    this.logger.debug(`Received message on topic ${topic}: ${message}`);
    if (!dup && this.messageCallback) {
      this.messageCallback(message);
    }
  }

  async connect(iotData: IoTData, callback: OnMessageCallback) {
    this.messageCallback = callback;
    this.client.create(iotData, this);
  }

  async send(topic: string, payload: string) {
    this.client?.publish(topic, payload);
  }

  async onModuleDestroy() {
    await this.client?.disconnect();
  }
}
