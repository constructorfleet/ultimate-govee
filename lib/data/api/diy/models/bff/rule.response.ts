import { Expose, Type } from 'class-transformer';
import { IoTMessage } from '../../../../iot/models/iot-message';

export class RuleResponse {
  @Expose({ name: 'cmdType' })
  commandType!: number;

  @Expose({ name: 'deviceType' })
  deviceType!: number;

  @Expose({ name: 'cmdVal' })
  commandValue!: string;

  @Expose({ name: 'iotMsg' })
  @Type(() => IoTMessage)
  iotMessage!: IoTMessage;

  @Expose({ name: 'blueMsg' })
  bluetoothMessage!: string;
}
