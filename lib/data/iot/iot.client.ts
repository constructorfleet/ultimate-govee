import { CrtError, iot, mqtt } from 'aws-iot-device-sdk-v2';
import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { EOL } from 'os';
import { ConfigType } from '@nestjs/config';
import { Optional } from '@constructorfleet/ultimate-govee/common';
import { IoTConfig } from './iot.config';
import { IoTHandler } from './iot.handler';
import { IoTData } from '../api';

@Injectable()
export class IoTClient implements OnModuleDestroy {
  private readonly logger: Logger = new Logger(IoTClient.name);
  private connection: Optional<mqtt.MqttClientConnection>;
  private connected = false;
  private subscriptions: string[] = [];

  constructor(
    @Inject(IoTConfig.KEY)
    private readonly config: ConfigType<typeof IoTConfig>,
  ) {}

  async create(iotData: IoTData, handler: IoTHandler): Promise<this> {
    this.logger.debug(`Adding ${iotData.topic} to subscriptions`);
    if (!this.subscriptions.includes(iotData.topic)) {
      this.subscriptions.push(iotData.topic);
    }
    const certificateWithCA = [
      iotData.certificate,
      this.config.certificateAuthority,
    ].join(EOL);
    const client: mqtt.MqttClient = new mqtt.MqttClient();
    const connectionConfig: mqtt.MqttConnectionConfig =
      iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder(
        certificateWithCA,
        iotData.privateKey,
      )
        .with_client_id(`AP/${iotData.accountId}/a${iotData.clientId}`)
        .with_endpoint(iotData.endpoint)
        .with_clean_session(false)
        .build();

    this.connection = client.new_connection(connectionConfig);
    this.bindEvents(this.connection, handler);

    this.logger.log('Connecting to IoT Core');
    await this.connection.connect();
    return this;
  }

  private bindEvents(
    iotConnection: mqtt.MqttClientConnection,
    handler: IoTHandler,
  ) {
    iotConnection.on('connect', () => {
      this.logger.log('Connected to AWS IoT Core');
      this.subscriptions.forEach(async (topic) => {
        if (topic === undefined) {
          return;
        }
        this.logger.log(`Subscribing to ${topic}`);
        await iotConnection.subscribe(topic, mqtt.QoS.AtLeastOnce);
      });
      this.connected = true;
    });
    iotConnection.on(
      'connection_failure',
      handler.onConnectionFailure
        ? handler.onConnectionFailure.bind(handler)
        : (data: mqtt.OnConnectionFailedResult) => {
            this.logger.error(`Error connecting to IoT ${data.error}`);
          },
    );
    iotConnection.on(
      'connection_success',
      handler.onConnectionSuccess
        ? handler.onConnectionSuccess.bind(handler)
        : (data: mqtt.OnConnectionSuccessResult) => {
            this.logger.debug(
              `Successfully ${
                data.session_present ? 're' : ''
              }connected to MQTT broker.`,
            );
          },
    );
    iotConnection.on(
      'message',
      (
        topic: string,
        payload: ArrayBuffer,
        dup: boolean,
        qos: mqtt.QoS,
        retain: boolean,
      ) => {
        handler.onMessage(topic, payload, dup, qos, retain);
      },
    );
    iotConnection.on('resume', (code: number, resumed: boolean) => {
      this.logger.debug(
        `Connection resumed with code ${code} with ${
          resumed ? 'existing' : 'new'
        } session.`,
      );
    });
    iotConnection.on('interrupt', (reason: CrtError) => {
      this.logger.debug(
        `Connection interrupted due to ${reason.error_name || reason.name}.`,
      );
    });
    iotConnection.on(
      'error',
      handler.onError
        ? handler.onError.bind(handler)
        : (reason: CrtError) => {
            this.logger.warn(
              'Unexpected error with connection to MQTT broker',
              reason,
              reason.error_code,
            );
          },
    );
    iotConnection.on('disconnect', () => {
      this.logger.log('Disconnected from MQTT broker.');
    });
    iotConnection.on('closed', () => {
      this.logger.log('Connection to MQTT broker closed.');
    });
  }

  async subscribe(topic: string) {
    if (!this.subscriptions.includes(topic)) {
      this.subscriptions.push(topic);
    }
    if (this.connection) {
      await this.connection.subscribe(topic, mqtt.QoS.AtLeastOnce);
    }
  }

  async publish(topic: string, payload: string) {
    if (this.connection && this.connected) {
      await this.connection.publish(
        topic,
        payload,
        mqtt.QoS.AtLeastOnce,
        false,
      );
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.disconnect();
      this.subscriptions = [];
    }
  }

  async onModuleDestroy() {
    this.connection?.removeAllListeners();
    await this.disconnect();
  }
}
