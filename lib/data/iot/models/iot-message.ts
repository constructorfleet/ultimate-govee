import { Expose, Transform, Type } from 'class-transformer';
import { Optional, base64ToHex, hexToBase64 } from '~ultimate-govee-common';

export type PowerState = {
  isOn: boolean;
};

export type BrightnessState = {
  brightness: number;
};

export type ColorState = {
  color: {
    red: number;
    green: number;
    blue: number;
  };
};

export type ColorTemperatureState = {
  colorTemInKelvin: number;
};

export type CurrentModeState = {
  mode: number;
};

export type ConnectedState = {
  connected: 'true' | 'false' | boolean;
};

export type StatusCurrentTemperature = {
  currentTemperature: number;
};

export type StatusSetTemperature = {
  setTemperature: number;
};

export type StatusCode = {
  code: string;
};

export type StatusState = {
  status: Partial<StatusCurrentTemperature> &
    Partial<StatusSetTemperature> &
    Partial<StatusCode>;
};

export type OpCommand = {
  command: string[];
};

export type OpMode = {
  mode: string;
  value: string[] | number[];
};

export type OpCodeMode = {
  opCode: 'mode';
  modeValue: string | string[];
};

export type OpCodeSleep = {
  opCode: 'sleep';
  sleepValue: string | string[];
};

export type OpCodeWakeup = {
  opCode: 'wakeup';
  wakeupValue: string | string[];
};

export type OpCodeTimer = {
  opCode: 'timer';
  timerValue: string | string[];
};

export type MessageOpType =
  | Partial<OpCommand>
  | Partial<OpMode>
  | Partial<OpCodeMode>
  | Partial<OpCodeSleep>
  | Partial<OpCodeTimer>
  | Partial<OpCodeWakeup>;

export type MessageStateType = Partial<PowerState> &
  Partial<ConnectedState> &
  Partial<BrightnessState> &
  Partial<ColorTemperatureState> &
  Partial<ColorState> &
  Partial<CurrentModeState> &
  Partial<StatusState>;

export class StateStatus {
  @Expose({ name: 'curTem' })
  currentTemperature?: Optional<number>;

  @Expose({ name: 'setTem' })
  setTemperature?: Optional<number>;

  @Expose({ name: 'stc' })
  code?: Optional<string>;
}

export class Color {
  @Expose({ name: 'r' })
  red!: number;

  @Expose({ name: 'g' })
  green!: number;

  @Expose({ name: 'b' })
  blue!: number;
}

export class MessageState {
  @Expose({ name: 'onOff' })
  @Transform(
    ({ value }) => {
      if (value === undefined) {
        return undefined;
      }
      return value === 'true' || value === true || value === 1;
    },
    { toClassOnly: true },
  )
  isOn?: Optional<boolean>;

  @Expose({ name: 'brightness' })
  brightness?: Optional<number>;

  @Expose({ name: 'colorTemInKelvin' })
  colorTemperature?: Optional<number>;

  @Expose({ name: 'color' })
  @Type(() => Color)
  color?: Optional<Color>;

  @Expose({ name: 'mode' })
  mode?: Optional<number>;

  @Expose({ name: 'connected' })
  @Transform(
    ({ value }) => {
      if (value === undefined) {
        return undefined;
      }
      return value === 'true' || value === true || value === 1;
    },
    { toClassOnly: true },
  )
  connected?: Optional<boolean>;

  @Expose({ name: 'sta' })
  @Type(() => StateStatus)
  status?: StateStatus;
}

export class MessageData {
  @Expose({ name: 'op' })
  op!: string;

  @Expose({ name: 'value' })
  value!: string;
}

export class MessageOp {
  @Expose({ name: 'command' })
  @Transform(({ value }) => value?.map(base64ToHex), {
    toClassOnly: true,
  })
  @Transform(({ value }) => value?.map(hexToBase64), {
    toPlainOnly: true,
  })
  command?: number[][];

  @Expose({ name: 'mode' })
  mode?: string;

  @Expose({ name: 'value' })
  value?: string | string[];

  @Expose({ name: 'opCode' })
  opCode?: string;

  @Expose({ name: 'modeValue' })
  modeValue?: string;

  @Expose({ name: 'sleepValue' })
  sleepValue?: string;

  @Expose({ name: 'timerValue' })
  timerValue?: string;

  @Expose({ name: 'wakeupValue' })
  wakeupValue?: string;
}

export class IoTMessage {
  @Expose({ name: 'proType' })
  proType!: number;

  @Expose({ name: 'sku' })
  model!: string;

  @Expose({ name: 'device' })
  deviceId!: string;

  @Expose({ name: 'softVersion' })
  softwareVersion?: string;

  @Expose({ name: 'wifiSoftVersion' })
  wifiSoftwareVersion?: string;

  @Expose({ name: 'cmd' })
  command!: string;

  @Expose({ name: 'type' })
  type!: 0;

  @Expose({ name: 'transaction' })
  transaction!: string;

  @Expose({ name: 'pactType' })
  pactType!: number;

  @Expose({ name: 'pactCode' })
  pactCode!: number;

  @Expose({ name: 'op' })
  @Type(() => MessageOp)
  op?: MessageOp;

  @Expose({ name: 'state' })
  @Type(() => MessageState)
  state!: MessageState;

  @Expose({ name: 'battery' })
  battery?: number;

  @Expose({ name: 'leakDetected' })
  leakDetected?: 'true' | 'false' | boolean;

  @Expose({ name: 'temperature' })
  temperature?: number;

  @Expose({ name: 'temperatureF' })
  temperatureF?: number;

  @Expose({ name: 'humidity' })
  humidity?: number;

  @Expose({ name: 'commands' })
  commands?: string[];

  @Expose({ name: 'bulb' })
  bulb?: string | string[];

  @Expose({ name: 'Data' })
  @Type(() => MessageData)
  data?: MessageData;
}
