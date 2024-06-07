import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Optional, unpaddedHexToArray } from '~ultimate-govee-common';
import { PersistResult } from '../../persist';
import { IoTData } from '../api';
import { IoTClient } from './iot.client';
import { IoTMessage } from './models/iot-message';
import { IoTHandler } from './iot.handler';
import { GoveeDeviceStatus } from '../govee-device';

const payloadDecoder = new TextDecoder();

const parseMessage = (payload: ArrayBuffer): IoTMessage => {
  const decoded = payloadDecoder.decode(payload);
  const plain = JSON.parse(decoded);
  if (decoded.includes('08:47:D6:37:37:32:61:61') || decoded.includes('open')) {
    new Logger('IoT ParseMessage').error(plain);
  }
  IoTService.recordRawMessage(plain.device, plain);
  return plainToInstance(IoTMessage, plain);
};

export type OnIoTMessageCallback = (message: GoveeDeviceStatus) => void;

@Injectable()
export class IoTService implements IoTHandler {
  private readonly logger: Logger = new Logger(IoTService.name);
  private messageCallback: Optional<OnIoTMessageCallback>;

  constructor(private readonly client: IoTClient) {}

  onMessage(topic: string, payload: ArrayBuffer, dup: boolean) {
    const message = parseMessage(payload);

    if (!dup && this.messageCallback) {
      this.messageCallback(IoTService.parseIoTMessage(message));
    }
  }

  async connect(iotData: IoTData, callback: OnIoTMessageCallback) {
    try {
      if (this.client !== undefined) {
        await this.client.disconnect();
      }
      this.messageCallback = callback;
      await this.client.create(iotData, this);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async disconnect() {
    return await this.client?.disconnect();
  }

  async send(topic: string, payload: string) {
    await this.client?.publish(topic, payload);
  }

  async subscribe(topic: string) {
    await this.client?.subscribe(topic);
  }

  private static parseIoTMessage(message: IoTMessage): GoveeDeviceStatus {
    const code = message.state?.status?.code;
    let humidityCode: Optional<number>;
    if (code !== undefined) {
      humidityCode = unpaddedHexToArray(code)?.slice(-1)[0];
    }

    const currentHumditity = message.humidity ? message.humidity : humidityCode;
    const result = {
      id: message.deviceId,
      model: message.model,
      pactCode: message.pactCode,
      pactType: message.pactType,
      cmd: message.command,
      state: {
        online: message.state?.connected,
        isOn: message.state?.isOn,
        temperature: {
          current: message.temperature,
        },
        humidity: {
          current: currentHumditity,
        },
        brightness: message.state?.brightness,
        colorTemperature: {
          current: message.state?.colorTemperature,
        },
        color:
          message.state?.color !== undefined
            ? {
                red: message.state.color.red,
                green: message.state.color.green,
                blue: message.state.color.blue,
              }
            : undefined,
        mode: message.state?.mode,
      },
      op: message.op,
    };
    this.recordMessage(result.id, result);
    return result;
  }

  @PersistResult({
    filename: 'govee.{0}.iot-status.json',
    // append: true,
  })
  static recordMessage(
    deviceId: string,
    message: GoveeDeviceStatus,
  ): GoveeDeviceStatus & { timestamp: number } {
    return {
      ...message,
      timestamp: Date.now(),
    };
  }

  @PersistResult({
    filename: 'govee.{0}.iot-raw.log',
    append: true,
  })
  static recordRawMessage(deviceId: string, message): any {
    return message;
  }
}
