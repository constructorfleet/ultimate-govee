import { Injectable, Logger, Scope } from '@nestjs/common';
import { reactiveEnum } from '@ngbites/reactive-enum';
import {
  connectAsync,
  IClientPublishOptions,
  IClientSubscribeOptions,
  IConnackPacket,
  IDisconnectPacket,
  IPublishPacket,
  MqttClient as MqttClientDelegate,
} from 'mqtt';
import { MqttConnection } from './mqtt.types';

enum ClientState {
  uninitialized,
  initialized,
  connecting,
  connected,
  reconnecting,
  disconnected,
  offline,
  ended,
  closed,
}

export type ClientStateListener = (state: ClientState) => Promise<void>;
export type MessageHandler = {
  handleMessage: (
    topic: string,
    message: string | Buffer,
    packet: IPublishPacket,
  ) => Promise<void>;
};

@Injectable({
  scope: Scope.TRANSIENT,
})
export class MqttClient {
  private readonly logger: Logger = new Logger('MqttClient');
  public readonly state = reactiveEnum(ClientState, {
    initialValue: ClientState.uninitialized,
  });
  private messageHander: MessageHandler | undefined;
  private delegate: MqttClientDelegate | undefined;

  async quit() {
    await this.delegate?.endAsync();
  }

  async connect(connection: MqttConnection, messagehandler: MessageHandler) {
    try {
      this.messageHander = messagehandler;
      this.delegate = await connectAsync(connection.brokerUrl, {
        username: connection.username,
        password: connection.password,
        clientId: connection.clientId,
      });

      this.delegate.on('connect', (packet) => {
        this.connectionHandler(packet);
      });
      this.delegate.on('reconnect', () => {
        this.reconnectHandler();
      });
      this.delegate.on('close', () => {
        this.closeHandler();
      });
      this.delegate.on('disconnect', (packet) => {
        this.disconnectHandler(packet);
      });
      this.delegate.on('offline', () => {
        this.offlineHandler();
      });
      this.delegate.on('error', (error) => {
        this.errorHandler(error);
      });
      this.delegate.on('end', () => {
        this.endHandler();
      });
      this.delegate.on(
        'message',
        async (
          topic: string,
          message: Buffer | string,
          packet: IPublishPacket,
        ) => {
          if (this.messageHander === undefined) {
            this.logger.warn(
              'Received message but mo message handler asssigned',
            );
            return;
          }
          await this.onMessage(topic, message, packet);
        },
      );
    } catch (error) {
      this.logger.error('Error connecting to MQTT broker', error);
    }
  }

  async publish(
    topic: string,
    message: Buffer | string,
    options?: IClientPublishOptions,
  ) {
    try {
      if (this.delegate === undefined) {
        throw new Error(
          'Unable to publish message to uninitiated MQTT client.',
        );
      }
      if (this.state.value() !== ClientState.connected) {
        throw new Error(
          'Unable to publish message to unconnected MQTT cleint.',
        );
      }
      await this.delegate.publishAsync(topic, message, options);
    } catch (error) {
      this.logger.error(`Error publishing to MQTT topic ${topic}`, error);
    }
  }

  async subscribe(topic: string, options?: IClientSubscribeOptions) {
    try {
      if (this.delegate === undefined) {
        throw new Error(
          'Unable to subscribe to topic to uninitiated MQTT client.',
        );
      }
      if (this.state.value() !== ClientState.connected) {
        throw new Error(
          'Unable to subscribe to topic to unconnected MQTT cleint.',
        );
      }
      return await this.delegate.subscribeAsync(topic, options);
    } catch (error) {
      this.logger.error(`Error subscribing to MQTT topic ${topic}`, error);
    }
  }

  private connectionHandler(_: IConnackPacket) {
    // TODO : connAct = true and clean is `false - rely on stored messages instead of subscribing
    this.state.set(ClientState.connected);
  }

  private reconnectHandler() {
    this.state.set(ClientState.reconnecting);
  }

  private closeHandler() {
    this.state.set(ClientState.closed);
  }

  private disconnectHandler(_: IDisconnectPacket) {
    this.state.set(ClientState.disconnected);
  }

  private offlineHandler() {
    this.state.set(ClientState.offline);
  }

  private errorHandler(error) {
    this.logger.error('Error during MQTT operations', error);
  }

  private endHandler() {
    this.state.set(ClientState.ended);
    this.messageHander = undefined;
    this.delegate = undefined;
  }

  private async onMessage(
    topic: string,
    message: Buffer | string,
    packet: IPublishPacket,
  ) {
    try {
      if (this.messageHander === undefined) {
        throw new Error(
          `No message handler defined to process message from ${topic}`,
        );
      }
      await this.messageHander.handleMessage(topic, message, packet);
    } catch (error) {
      this.logger.error('Unable to processes message', error);
    }
  }
}
