import {
  Ignorable,
  Optional,
  createBitFlagsEnum,
  BitFlagValue,
} from '~ultimate-govee-common';
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
  unit?: string;
};

export type OpCommandIdentifier = {
  opType?: Ignorable<Optional<number>>;
  identifier?: Ignorable<Optional<number[]>>;
};

const ParseOptionValues = ['opCode', 'multiOp', 'state', 'none'] as const;
export const ParseOption = createBitFlagsEnum(ParseOptionValues);
export type ParseOption = BitFlagValue<
  readonly ['opCode', 'multiOp', 'state', 'none']
>;

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
