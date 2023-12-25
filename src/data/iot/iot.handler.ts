import { mqtt } from 'aws-iot-device-sdk-v2';

export enum ConnectionState {
  Disconnected,
  Connecting,
  Connected,
  Error,
  Interrupted,
  Closed,
}

export type Subscriber = (
  onMessage: (
    topic: string,
    payload: ArrayBuffer,
    dup: boolean,
    qos: mqtt.QoS,
    retain: boolean,
  ) => Promise<void>,
  subsciptionTopic: string,
  subscriptionQos?: mqtt.QoS,
) => Promise<void>;

export type Publisher = (
  topic: string,
  payload: mqtt.Payload,
  qos?: mqtt.QoS,
  retain?: boolean,
) => Promise<void>;

export interface IoTHandler {
  set state(state: ConnectionState);
  get subscriber(): Subscriber;
  set subscriber(subsciber: Subscriber);
  get publisher(): Publisher;
  set publisher(publisher: Publisher);

  onConnected?: (resumed: boolean) => Promise<void>;
  onDisconnected?: () => Promise<void>;
  onClosed?: () => Promise<void>;
  onError?: <TError = unknown>(reason: TError) => Promise<void>;
  onConnectionFailure?: <TError = unknown>(reason: TError) => Promise<void>;
  onConnectionSuccess?: (resumed: boolean) => Promise<void>;
  onInterrupt?: <TError = unknown>(reason: TError) => Promise<void>;
  onResume?: (code: number, resumed: boolean) => Promise<void>;
  onMessage?: (
    topic: string,
    payload: ArrayBuffer,
    dup: boolean,
    qos: mqtt.QoS,
    retain: boolean,
  ) => Promise<void>;
  unsubscribe?: (topic: string) => Promise<void>;
  disconnect?: () => Promise<void>;
  connect?: () => Promise<void>;
}
