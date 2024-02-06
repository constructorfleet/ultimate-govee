import { DeviceId } from '@govee/common';

export type WiFiData = {
  name?: string;
  mac: string;
  softwareVersion: string;
  hardwareVersion: string;
};

export type BluetoothData = {
  name: string;
  mac: string;
};

export type Measurement = {
  min?: number;
  max?: number;
  calibration?: number;
  warning?: boolean;
  current?: number;
};

export type GoveeDeviceStatus = {
  id: string;
  cmd?: string;
  model: string;
  pactType: number;
  pactCode: number;
  state: {
    battery?: number;
    online?: boolean;
    isOn?: boolean;
    temperature?: Measurement;
    humidity?: Measurement;
    lastTime?: number;
    waterShortage?: boolean;
    boilWaterCompleteNotification?: boolean;
    completeNotification?: boolean;
    autoShudown?: boolean;
    filterExpired?: boolean;
    playState?: boolean;
    mode?: number;
    brightness?: number;
    color?: {
      red: number;
      green: number;
      blue: number;
    };
  };
  op?: {
    command?: number[][];
  };
};

export type GoveeCommandDataColor = {
  red: number;
  green: number;
  blue: number;
};

export type GoveeCommandDataColorRGB = {
  r: number;
  g: number;
  b: number;
};

export type GoveeCommandData = {
  commandOp?: number[][];
  color?: GoveeCommandDataColor | GoveeCommandDataColorRGB;
  value?: number | string | string[];
  colorTemperature?: number;
  opcode?: string;
};

export type GoveeCommand =
  | 'pt'
  | 'ptReal'
  | 'turn'
  | 'brightness'
  | 'color'
  | 'colorTem'
  | 'colorwc';

export type GoveeDeviceCommand = {
  deviceId: DeviceId;
  command?: GoveeCommand;
  type?: number;
  cmdVersion?: number;
  data: GoveeCommandData;
};

export type GoveeDevice = {
  id: string;
  name: string;
  model: string;
  ic: number;
  iotTopic?: string;
  groupId: number;
  pactType: number;
  pactCode: number;
  goodsType: number;
  softwareVersion: string;
  hardwareVersion: string;
  wifi?: WiFiData;
  blueTooth?: BluetoothData;
} & GoveeDeviceStatus;
