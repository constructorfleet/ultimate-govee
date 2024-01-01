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
  current: number;
};

export type GoveeDeviceStatus = {
  id: string;
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
  };
  op?: {
    command?: number[][];
  };
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
