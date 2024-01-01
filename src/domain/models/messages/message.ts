export type MessageOp = {
  command?: string[];
  opCode?: string;
  mode?: string;
  value?: string[];
  modeValue?: string;
  sleepValue?: string;
  wakeupValue?: string;
  timerValue?: string;
};

export type MessageState = {
  onOff?: number;
  connected?: 'true' | 'false' | boolean;
  brightness?: number;
  colorTemperature?: number;
  color?: {
    r: number;
    g: number;
    b: number;
  };
  mode?: number;
  result: number;
  status: {
    curTem?: number;
    setTem?: number;
    stc?: string;
  };
};

export type Message = {
  proType: number;
  sku: string;
  device: string;
  softVersion: string;
  wifiSoftVersion?: string;
  cmd: string;
  type: 0;
  transaction: string;
  pactType: number;
  pactCode: number;
  op: MessageOp;
  state: MessageState;
  battery?: number;
  leakDetected?: 'true' | 'false' | boolean;
  temperature?: number;
  temperatureF?: number;
  humidity?: number;
  commands?: string[];
  bulb?: string | string[];
  data?: {
    op?: string;
    value?: string | string[];
  };
};
