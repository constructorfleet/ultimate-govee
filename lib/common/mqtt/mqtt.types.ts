import { ConfigurableModuleBuilder } from '@nestjs/common';
import { MqttClient } from './mqtt.client';
export type MqttIndividualOptions = {
  _kind: 'individual';
  protocol: 'mqtt' | 'mqtts' | 'ws' | 'wss';
  brokerHost: string;
  brokerPort: number;
};

export type MqttCombinedOptions = {
  _kind: 'combined';
  brokerUrl: string;
};

export type MqttDeserializeMessage<MqttMessageType> = (
  message: string | Buffer,
) => MqttMessageType;

export type MqttMessageProcessor<MqttMessageType> = {
  deserializeMessage(message: string | Buffer): MqttMessageType;
};
export type MqttMessageHandler<MqttMessageType> = {
  handle(message: MqttMessageType, topic?: string): Promise<void>;
};
export type MqttConnectionOtpions = MqttIndividualOptions | MqttCombinedOptions;
export type MqttCredentials = {
  username?: string;
  password?: string;
  clientId?: string;
};

export type MqttConnection = {
  username?: string;
  password?: string;
  clientId?: string;
  topic?: string;
  brokerUrl: string;
};

export type MqttClientFactory = (
  connection: MqttConnection,
) => Promise<MqttClient>;

export type MqttPublishOptionProperties = Partial<{
  payloadFormatIndicator: boolean;
  messageExpiryInterval: number;
  topicALias: number;
  responseTOpic: string;
  correlationData: Buffer;
  userProperties: unknown;
  subscriptionIdentifier: number;
  contentType: string;
}>;

export type MqttPublishOptions = Partial<{
  qos: number;
  retain: boolean;
  dup: boolean;
  properties: Partial<MqttPublishOptionProperties>;
}>;

export type MqttSubscribeProperties = Partial<{
  subscriptionIdentifier: number;
  userProperties: unknown;
}>;

export type MqttSubscribeOptions = Partial<{
  qos: number;
  rap: boolean;
  rh: boolean;
  properties: MqttSubscribeProperties;
}>;

export type MqttUnsubscribeProeprties = Partial<{
  subscriptionIdentifier: number;
  userProperties: unknown;
}>;

export type MqttUnsubscribeOptions = Partial<{
  qos: number;
  rap: boolean;
  rh: boolean;
  properties: MqttUnsubscribeProeprties;
}>;

export type MqttEndProperties = Partial<{
  sessioNExpiryInterval: number;
  reasonString: string;
  userProperties: unknown;
  serverReference: string;
}>;

export type MqttEndOptions = Partial<{
  resposneCode: number;
  properties: MqttEndProperties;
}>;

export const {
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<
  MqttConnectionOtpions & MqttMessageProcessor<any>
>({
  moduleName: 'MqttModule',
  optionsInjectionToken: 'Options.Module.Mqtt',
})
  .setClassMethodName('forFeature')
  .build();
