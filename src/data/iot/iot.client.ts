import { CrtError, iot, mqtt } from 'aws-iot-device-sdk-v2';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EOL } from 'os';
import { ConfigType } from '@nestjs/config';
import { IoTConfig } from './iot.config';
import { IoTData } from '../../domain/models/account-client';
import { IoTHandler } from './iot.handler';

@Injectable()
export class IoTClient {
  private readonly logger: Logger = new Logger();
  private connection: mqtt.MqttClientConnection | undefined;
  private subscriptions: Set<string> = new Set<string>();

  constructor(
    @Inject(IoTConfig.KEY)
    private readonly config: ConfigType<typeof IoTConfig>,
  ) {}

  create(iotData: IoTData, handler: IoTHandler): this {
    this.subscriptions.add(iotData.topic);
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
    const connection = client.new_connection(connectionConfig);
    this.bindEvents(connection, handler);
    return this;
  }

  private bindEvents(
    iotConnection: mqtt.MqttClientConnection,
    handler: IoTHandler,
  ) {
    iotConnection.on('connect', async () => {
      this.logger.log('Connected to AWS IoT Core');
      Array.from(this.subscriptions).forEach(
        async (topic) =>
          this.connection &&
          this.connection.subscribe(topic, mqtt.QoS.AtLeastOnce),
      );
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
    iotConnection.on('message', handler.onMessage.bind(handler));
    iotConnection.on('resume', async (code: number, resumed: boolean) => {
      this.logger.debug(
        `Connection resumed with code ${code} with ${
          resumed ? 'existing' : 'new'
        } session.`,
      );
    });
    iotConnection.on('interrupt', async (reason: CrtError) => {
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
              `Unexpected error with connection to MQTT broker`,
              reason,
            );
          },
    );
    iotConnection.on('disconnect', async () => {
      this.logger.debug(`Disconnected from MQTT broker.`);
    });
    iotConnection.on('closed', async () => {
      this.logger.debug(`Connection to MQTT broker closed.`);
    });
  }

  async subscribe(topic: string) {
    this.subscriptions.add(topic);
    if (this.connection) {
      await this.connection.subscribe(topic, mqtt.QoS.AtLeastOnce);
    }
  }

  async publish(topic: string, payload: string) {
    if (this.connection) {
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
    }
  }
}
