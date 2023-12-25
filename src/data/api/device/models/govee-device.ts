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
  min: number;
  max: number;
  calibration: number;
  warning: boolean;
  current: number;
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
  battery?: number;
  online: boolean;
  isOn?: boolean;
  temperature?: Measurement;
  humidity?: Measurement;
  lastTime?: number;
  wifi?: WiFiData;
  blueTooth?: BluetoothData;
  waterShortage?: boolean;
  boilWaterCompleteNotification?: boolean;
  completeNotification?: boolean;
  autoShudown?: boolean;
  filterExpired?: boolean;
  playState?: boolean;
};
