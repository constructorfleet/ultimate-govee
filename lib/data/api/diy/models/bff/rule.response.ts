import { Expose, plainToInstance, Transform, Type } from 'class-transformer';
import { IoTMessage } from '../../../../iot/models/iot-message';

export class BleMessage {
  @Expose({ name: 'type' })
  type!: string;

  @Expose({ name: 'bleCmd' })
  command!: string;

  @Expose({ name: 'switchCmd' })
  switch?: string;

  @Expose({ name: 'modeCmd' })
  mode?: string;

  @Expose({ name: 'secretCodeCmd' })
  secretCode?: string;
}

export class CommandMessage {
  @Expose({ name: 'open' })
  open?: number;

  @Expose({ name: 'diyName' })
  diyName?: string;

  @Expose({ name: 'effectId' })
  effectId?: number;

  @Expose({ name: 'scenesCode' })
  scenesCode?: number;

  @Expose({ name: 'sceneId' })
  sceneId?: number;

  @Expose({ name: 'scenesStr' })
  scenesStr?: number;

  @Expose({ name: 'brightness' })
  brightness?: number;

  @Expose({ name: 'featstId' })
  feastId?: number;

  @Expose({ name: 'colorValue' })
  colorValue?: number;
}

export class RuleResponse {
  @Expose({ name: 'cmdType' })
  commandType!: number;

  @Expose({ name: 'deviceType' })
  deviceType!: number;

  @Expose({ name: 'cmdVal' })
  commandValue!: string;

  @Expose({ name: 'iotMsg' })
  @Type(() => IoTMessage)
  @Transform(({ value }) => plainToInstance(IoTMessage, JSON.parse(value)))
  iotMessage!: IoTMessage;

  @Expose({ name: 'blueMsg' })
  @Type(() => BleMessage)
  @Transform(({ value }) => plainToInstance(BleMessage, JSON.parse(value)))
  bluetoothMessage!: BleMessage;
}
