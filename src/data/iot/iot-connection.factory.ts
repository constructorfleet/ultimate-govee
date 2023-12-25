import { iot, mqtt } from 'aws-iot-device-sdk-v2';
import { Inject, Injectable } from '@nestjs/common';
import { EOL } from 'os';
import { ConfigType } from '@nestjs/config';
import { IoTConfig } from './iot.config';
import { IoTData } from '../../domain/models/account-client';

@Injectable()
export class IoTConnectionFactory {
  constructor(
    @Inject(IoTConfig.KEY)
    private readonly config: ConfigType<typeof IoTConfig>,
  ) {}

  getConnection(iotData: IoTData): mqtt.MqttClientConnection {
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
    return client.new_connection(connectionConfig);
  }
}
