import { FactoryProvider, Inject, Scope } from '@nestjs/common';
import {
  MODULE_OPTIONS_TOKEN,
  MqttClientFactory,
  MqttConnection,
  MqttDeserializeMessage,
  OPTIONS_TYPE,
} from './mqtt.types';
import { MqttClient } from './mqtt.client';
import { ModuleRef } from '@nestjs/core';

let lastMqttClient: MqttClient | undefined;
let lastConnection: MqttConnection | undefined;

export const MqttBrokerKey = 'Mqtt.Broker';
export const InjectMqttBroker = Inject(MqttBrokerKey);
export const MqttBrokerProvider: FactoryProvider = {
  provide: MqttBrokerKey,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: (options: typeof OPTIONS_TYPE): MqttConnection => ({
    brokerUrl:
      options._kind === 'combined'
        ? options.brokerUrl
        : `${options.protocol}://${options.brokerHost}:${options.brokerPort}`,
  }),
};

export const LastMqttClientKey = 'Mqtt.Client.Last';
export const LastMqttConnectionKey = 'Mqtt.Connection.Last';
export const LastMqttClientProvider: FactoryProvider = {
  scope: Scope.TRANSIENT,
  provide: LastMqttClientKey,
  useFactory: () => lastMqttClient,
};
export const LastMqttConnectionProvider: FactoryProvider = {
  scope: Scope.TRANSIENT,
  provide: LastMqttConnectionKey,
  useFactory: () => lastConnection,
};

export const MqttDeserializerKey = 'Mqtt.Deserializer';
export const InjectMqttDeserializer = Inject(MqttDeserializerKey);
export const MqttDeserializerProvider: FactoryProvider = {
  provide: MqttDeserializerKey,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: <MqttMessageType>(
    options: typeof OPTIONS_TYPE,
  ): MqttDeserializeMessage<MqttMessageType> => options.deserializeMessage,
};

export const areConnectionsTheSame = (
  connection: MqttConnection | undefined,
  otherConnection: MqttConnection | undefined,
): boolean => {
  if (connection === undefined) {
    if (otherConnection === undefined) {
      return true;
    }
    if (otherConnection !== undefined) {
      return false;
    }
  } else if (otherConnection === undefined) {
    if (connection === undefined) {
      return true;
    }
    if (connection !== undefined) {
      return false;
    }
  }

  const keysA = Object.keys(
    connection ?? {},
  ).sort() as (keyof MqttConnection)[];
  const keysB = Object.keys(
    otherConnection ?? {},
  ).sort() as (keyof MqttConnection)[];

  if (keysA.length !== keysB.length) {
    return false;
  }

  return keysA.every(
    (key, i) =>
      otherConnection !== undefined &&
      key === keysB[i] &&
      connection![key] === otherConnection[key],
  );
};

export const MqttClientFactoryKey = 'Mqtt.Client.Factory';
export const InjectMQTTFactory = Inject('Mqtt.Client.Factory');
export const MqttClientFactoryProvider: FactoryProvider = {
  provide: MqttClientFactoryKey,
  scope: Scope.TRANSIENT,
  inject: [LastMqttClientKey, LastMqttConnectionKey, ModuleRef],
  useFactory:
    (
      lastClient: MqttClient,
      lastConnection: MqttConnection,
      moduleRef: ModuleRef,
    ): MqttClientFactory =>
    async (connection: MqttConnection): Promise<MqttClient> => {
      if (
        areConnectionsTheSame(connection, lastConnection) &&
        lastClient.state.connected$
      ) {
        lastMqttClient = lastClient;
        return Promise.resolve(lastClient);
      }
      if (lastClient !== undefined) {
        await lastClient.quit();
        lastMqttClient = undefined;
      }
      lastMqttClient = await moduleRef.create(MqttClient);
      return lastMqttClient;
    },
};
