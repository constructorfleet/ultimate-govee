import { Injectable, Logger } from '@nestjs/common';
import { ISubscriptionGrant } from 'mqtt';
import { Subscription } from 'rxjs';
import { Optional } from '../types';
import { MessageHandler, MqttClient } from './mqtt.client';
import {
  InjectMqttBroker,
  InjectMqttDeserializer,
  InjectMQTTFactory,
} from './mqtt.providers';
import {
  MqttClientFactory,
  MqttConnection,
  MqttCredentials,
  MqttDeserializeMessage,
  MqttMessageHandler,
} from './mqtt.types';

const isValidConnection = (connection: MqttConnection): boolean => {
  const matches = connection.brokerUrl?.match(
    /^(?<protocol>(?:wss?)|(?:mqtts?)):\/\/(?<host>[^:]+):?(?:port[0-9+])?\/.+/,
  );
  if (!matches || !matches.groups) {
    return false;
  }
  if (!matches.groups['protocol'] && !matches['host']) {
    return false;
  }
  return true;
};

@Injectable()
export class MqttService<IotMessageType> implements MessageHandler {
  private readonly logger: Logger = new Logger(MqttService.name);
  private client: MqttClient | undefined;
  private messageHandler: MqttMessageHandler<IotMessageType> | undefined;
  private readonly subscriptions: Subscription[] = [];
  private readonly subscriptionGrants: ISubscriptionGrant[] = [];

  constructor(
    @InjectMqttDeserializer
    private readonly deserializer: MqttDeserializeMessage<IotMessageType>,
    @InjectMqttBroker
    private readonly broker: string,
    @InjectMQTTFactory private readonly factory: MqttClientFactory,
  ) {}

  protected deserializeMessage(message: string | Buffer): IotMessageType {
    return this.deserializer(message);
  }

  async handleMessage(topic: string, payload: string | Buffer): Promise<void> {
    if (this.messageHandler === undefined) {
      return;
    }
    const message = this.deserializeMessage(payload);
    await this.messageHandler?.handle(message);
  }

  async publish(topic: string, payload: string | Buffer): Promise<void> {
    if (!this.client) {
      this.logger.warn(
        `Cannot publish payload to ${topic}, not connected to broker.`,
      );
      return;
    }

    await this.client.publish(topic, payload);
  }

  async connect(
    credentials: MqttCredentials,
    messageHandler: MqttMessageHandler<IotMessageType>,
  ) {
    const connection = {
      brokerUrl: this.broker,
      ...credentials,
    };
    if (!isValidConnection(connection)) {
      throw new Error(
        'The connection provided is invalid please check your configuration.',
      );
    }
    this.messageHandler = messageHandler;
    if (this.client !== undefined) {
      this.subscriptions.forEach((s) => s.unsubscribe());
      await this.client.quit();
    }
    await this.createClientAndConnect(connection);
  }

  async disconnect() {
    if (this.client === undefined) {
      return;
    }
    await this.client.quit();
  }

  private async createClientAndConnect(connection: MqttConnection) {
    this.client = await this.factory(connection);
    this.subscriptions.push(
      this.client.state.connected$.subscribe(() =>
        this.doSubscribe([connection.topic]),
      ),
    );
  }

  private async doSubscribe(topics: Optional<string>[]) {
    if (this.client === undefined) {
      return;
    }
    await Promise.all(
      topics
        .filter((t) => t !== undefined)
        .map(async (topic) => await this.subscribe(topic)),
    );
  }

  async subscribe(topic: Optional<string>) {
    if (this.client === undefined || topic === undefined) {
      return;
    }
    const grant = await this.client
      ?.subscribe(topic!)
      ?.then((sub) =>
        sub?.forEach((s) => s !== undefined && this.subscriptionGrants.push(s)),
      );
    if (grant === undefined) {
      return;
    }

    this.subscriptionGrants.push(grant);
  }
}
