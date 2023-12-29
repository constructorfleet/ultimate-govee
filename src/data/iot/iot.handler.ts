import { mqtt } from 'aws-iot-device-sdk-v2';
import { IoTMessage } from './models/iot-message';

export enum ConnectionState {
  Disconnected,
  Connecting,
  Connected,
  Error,
  Interrupted,
  Closed,
}

export type MessageHandler = (
  topic: string,
  message: IoTMessage,
  dup: boolean,
  qos: mqtt.QoS,
  retain: boolean,
) => Promise<void>;

export type Subscriber = (
  onMessage: MessageHandler,
  subsciptionTopic: string,
  subscriptionQos?: mqtt.QoS,
) => Promise<void>;

export type Publisher = (
  topic: string,
  message: IoTMessage,
  qos?: mqtt.QoS,
  retain?: boolean,
) => Promise<void>;

export interface IoTHandler {
  onConnected?: (resumed: boolean) => void;
  onError?: <TError = unknown>(data: { error: TError }) => void;
  onConnectionFailure?: <TError = unknown>(data: { error: TError }) => void;
  onConnectionSuccess?: (data: { session_present: boolean }) => void;
  onMessage: (
    topic: string,
    payload: ArrayBuffer,
    dup: boolean,
    qos: mqtt.QoS,
    retain: boolean,
  ) => void;
}
