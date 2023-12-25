import { Injectable, Logger } from '@nestjs/common';
import { mqtt } from 'aws-iot-device-sdk-v2';
import { IoTData } from '../../domain/models/account-client';
import { IoTConnectionFactory } from './iot-connection.factory';
import { ConnectionState, IoTHandler } from './iot.handler';

@Injectable()
export class IoTService {
  private readonly logger: Logger = new Logger(IoTService.name);

  constructor(private readonly factory: IoTConnectionFactory) {}

  async connect(iotData: IoTData, handler: IoTHandler) {
    const iotConnection: mqtt.MqttClientConnection =
      this.factory.getConnection(iotData);

    iotConnection.on('connect', async () => {
      handler.state = ConnectionState.Connected;
      if (handler.connect) {
        await handler.connect();
      }
    });
    iotConnection.on(
      'connection_failure',
      async (data: mqtt.OnConnectionFailedResult) => {
        handler.state = ConnectionState.Error;
        if (handler.onConnectionFailure) {
          await handler.onConnectionFailure(data);
        }
      },
    );
    iotConnection.on(
      'connection_success',
      async (data: mqtt.OnConnectionSuccessResult) => {
        handler.state = ConnectionState.Connected;
        if (handler.onConnectionSuccess) {
          await handler.onConnectionSuccess(data.session_present);
        }
      },
    );
    iotConnection.on('resume', async (code: number, resumed: boolean) => {
      handler.state = ConnectionState.Connected;
      if (handler.onResume) {
        await handler.onResume(code, resumed);
      }
    });
    iotConnection.on('interrupt', async (reason: unknown) => {
      handler.state = ConnectionState.Interrupted;
      if (handler.onInterrupt) {
        await handler.onInterrupt(reason);
      }
    });
    iotConnection.on('error', async (reason: unknown) => {
      handler.state = ConnectionState.Error;
      if (handler.onError) {
        await handler.onError(reason);
      }
    });
    iotConnection.on('disconnect', async () => {
      handler.state = ConnectionState.Disconnected;
      if (handler.onDisconnected) {
        await handler.onDisconnected();
      }
    });
    iotConnection.on('closed', async () => {
      handler.state = ConnectionState.Closed;
      if (handler.onClosed) {
        await handler.onClosed();
      }
    });
    handler.publisher = async (
      topic: string,
      payload: mqtt.Payload,
      qos: mqtt.QoS = mqtt.QoS.AtLeastOnce,
      retain: boolean = false,
    ) => {
      await iotConnection.publish(topic, payload, qos, retain);
    };
    handler.subscriber = async (
      onMessage: (
        topic: string,
        payload: ArrayBuffer,
        dup: boolean,
        qos: mqtt.QoS,
        retain: boolean,
      ) => Promise<void>,
      subsciptionTopic: string,
      subscriptionQos: mqtt.QoS = mqtt.QoS.AtLeastOnce,
    ) => {
      await iotConnection.subscribe(
        subsciptionTopic,
        subscriptionQos,
        onMessage,
      );
    };

    return iotConnection;
  }
}
