import { Ignorable, Optional } from '~ultimate-govee-common';
import {
  GoveeDeviceStateCommand,
  GoveeDeviceStatus,
  GoveeStatusForStateCommand,
} from '~ultimate-govee-data';

export type MeasurementData = {
  range?: {
    min: number;
    max: number;
  };
  calibration?: number;
  raw?: number;
  current?: number;
};

export type OpCommandIdentifier = {
  opType?: Ignorable<Optional<number>>;
  identifier?: Ignorable<Optional<number[]>>;
};

export type ParseOption = 'opCode' | 'state' | 'both';

export type CommandResult = {
  state: string;
  value: any;
  commandId: string;
};

export type MessageData = Partial<GoveeDeviceStatus>;

export type StateCommandAndStatus = {
  command: GoveeDeviceStateCommand;
  status: GoveeStatusForStateCommand;
};
