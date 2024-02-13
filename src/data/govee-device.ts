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
    pm25?: Measurement;
    mode?: number;
    brightness?: number;
    tempProbes?: Record<number, number>;
    colorTemperature?: number;
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
  command?: number[][] | string[];
  color?: GoveeCommandDataColor | GoveeCommandDataColorRGB;
  value?: number | string | string[];
  val?: number | string | string[];
  colorTemInKelvin?: number;
  opcode?: string;
  modeValue?: string;
};

export type GoveeCommand =
  | 'pt'
  | 'ptReal'
  | 'mode'
  | 'turn'
  | 'brightness'
  | 'color'
  | 'colorTem'
  | 'colorwc';

export type GoveeDeviceCommand = {
  commandId: string;
  deviceId: DeviceId;
  command?: GoveeCommand;
  type?: number;
  cmdVersion?: number;
  data: GoveeCommandData;
};

export type GoveeDeviceStateCommand =
  | Omit<GoveeDeviceCommand, 'deviceId' | 'commandId'>
  | Omit<GoveeDeviceCommand, 'deviceId' | 'commandId'>[];
export type GoveeStatusForStateCommand =
  | Partial<
      Pick<GoveeDeviceStatus, 'state'> & {
        op?: { command: (number | undefined)[][] };
      }
    >
  | Partial<
      Pick<GoveeDeviceStatus, 'state'> & {
        op?: { command: (number | undefined)[][] };
      }
    >[];

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
