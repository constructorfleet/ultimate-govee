import { chunk, total } from '~ultimate-govee-common';
import { DeviceModel } from '../../../devices.model';
import { DeviceOpState } from '../../../states/device.state';
import { ParseOption } from '../../../states/states.types';

export type ProbeNumber = 1 | 2 | 3 | 4;

export const BuzzerStateName: 'buzzer' = 'buzzer' as const;
export type BuzzerStateName = typeof BuzzerStateName;

export class BuzzerState extends DeviceOpState<
  BuzzerStateName,
  boolean | undefined
> {
  constructor(
    device: DeviceModel,
    defaultState: boolean | undefined = undefined,
  ) {
    super(
      { opType: null },
      device,
      BuzzerStateName,
      defaultState,
      ParseOption.multiOp,
    );
  }

  parseMultiOpCommand(opCommands: number[][]): void {
    const opCommand = opCommands[0];
    if ([0, 1].includes(opCommand[6])) {
      this.stateValue.next(opCommand[6] === 1);
    }
  }
}

export const TemperatureUnitStateName: 'temperatureUnit' =
  'temperatureUnit' as const;
export type TemperatureUnitStateName = typeof TemperatureUnitStateName;

export class TemperatureUnitState extends DeviceOpState<
  BuzzerStateName,
  'F' | 'C' | undefined
> {
  constructor(
    device: DeviceModel,
    defaultState: 'F' | 'C' | undefined = undefined,
  ) {
    super(
      { opType: null },
      device,
      BuzzerStateName,
      defaultState,
      ParseOption.multiOp,
    );
  }

  parseMultiOpCommand(opCommands: number[][]): void {
    const opCommand = opCommands[0];
    this.stateValue.next(opCommand[2] === 1 ? 'F' : 'C');
  }
}

export const EarlyWarningStateName: 'earlyWarning' = 'earlyWarning' as const;
export type EarlyWarningStateName = typeof EarlyWarningStateName;

export enum EarlyWarningOffset {
  OFF = 'OFF',
  LOW = 'low',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}
export type EarlyWarning = {
  enabled?: boolean;
  setting?: EarlyWarningOffset;
};

// const EarlyWarningTempMap = {
//   [EarlyWarningOffset.OFF]: 0,
//   [EarlyWarningOffset.LOW]: 244,
//   [EarlyWarningOffset.MEDIUM]: 232,
//   [EarlyWarningOffset.HIGH]: 220,
// };

export class EarlyWarningState extends DeviceOpState<
  EarlyWarningStateName,
  EarlyWarning | undefined
> {
  constructor(
    device: DeviceModel,
    defaultState: EarlyWarning | undefined = undefined,
  ) {
    super(
      { opType: null },
      device,
      EarlyWarningStateName,
      defaultState,
      ParseOption.multiOp,
    );
  }

  parseMultiOpCommand(opCommands: number[][]): void {
    const opCommand = opCommands[0];
    if ([0, 1, 3, 5].includes(opCommand[3])) {
      let warning: EarlyWarningOffset = EarlyWarningOffset.OFF;
      switch (opCommand[4]) {
        case 0:
          warning = EarlyWarningOffset.OFF;
          break;
        case 1:
          warning = EarlyWarningOffset.LOW;
          break;
        case 3:
          warning = EarlyWarningOffset.MEDIUM;
          break;
        case 5:
          warning = EarlyWarningOffset.HIGH;
          break;
      }
      this.stateValue.next({
        enabled: opCommand[3] !== 0,
        setting: warning,
      });
    }
  }
}

const getProbeReading = (
  opCommands: number[][],
  probe: ProbeNumber,
): number[] => {
  const opCommand = opCommands.reduce((acc, opCommand) => {
    return [...acc, ...opCommand];
  }, [] as number[]);
  const readings = chunk(opCommand.slice(10), 9);
  return readings[probe - 1];
};

export const ProbeTempStateName: 'probeTemp' = 'probeTemp' as const;
export type ProbeTempStateName<Probe extends ProbeNumber> =
  `${typeof ProbeTempStateName}${Probe}`;

export class ProbeTempState<Probe extends ProbeNumber> extends DeviceOpState<
  ProbeTempStateName<Probe>,
  number | undefined
> {
  constructor(
    device: DeviceModel,
    private readonly probe: Probe,
    defaultState: number | undefined = undefined,
  ) {
    super(
      { opType: null },
      device,
      `${ProbeTempStateName}${probe}`,
      defaultState,
      ParseOption.multiOp,
    );
  }

  parseMultiOpCommand(opCommands: number[][]): void {
    const temp = total(getProbeReading(opCommands, this.probe).slice(0, 2));
    this.stateValue.next(temp / 100);
  }
}

export const PresetStateName: 'preset' = 'preset' as const;
export type PresetStateName<Probe extends ProbeNumber> =
  `${typeof PresetStateName}${Probe}`;

export type Food =
  | 'BEEF'
  | 'PORK'
  | 'POULTRY'
  | 'TURKEY'
  | 'FISH'
  | 'DIY'
  | 'VEAL'
  | 'SAUSAGE'
  | 'HAM'
  | 'SHRIMP'
  | 'POTATO'
  | 'CUPCAKE'
  | 'EGG';

export const FoodMap = {
  BEEF: 0,
  LAMB: 1,
  PORK: 2,
  POULTRY: 3,
  TURKEY: 4,
  FISH: 5,
  DIY: 6,
  VEAL: 7,
  SAUSAGE: 8,
  HAM: 9,
  SHRIMP: 10,
  POTATO: 11,
  CUPCAKE: 12,
  EGG: 13,
};

export type MeatDoneLevel =
  | 'RARE'
  | 'MEDIUM_RARE'
  | 'MEDIUM'
  | 'MEDIUM_WELL'
  | 'WELL_DONE';
export type HamDoneLevel = 'RAW' | 'PRE_COOKER';
export type PorkDoneLevel = 'MEDIUM' | 'WELL_DONE';
export type ReferenceDoneLevel = 'REFERENCE';
export type DIYAlarm = 'LOW' | 'HIGH' | 'RANGE';

export type DoneLevel<FoodType extends Food> = FoodType extends 'DIY'
  ? DIYAlarm
  : FoodType extends 'SAUSAGE' | 'HAM'
    ? HamDoneLevel
    : FoodType extends 'PORK'
      ? PorkDoneLevel
      : FoodType extends 'BEEF' | 'VEAL' | 'LAMB'
        ? MeatDoneLevel
        : ReferenceDoneLevel;

export const DIYDoneLevel = {
  LOW: 1,
  HIGH: 2,
  RANGE: 3,
};

export const SausageHameDoneLevel = {
  RAW: 1,
  PRE_COOKER: 2,
};

export const PorkDoneLevel = {
  MEDIUM: 1,
  WELL_DONE: 2,
};

export const MeatDoneLevel = {
  RARE: 1,
  MEDIUM_RARE: 2,
  MEDIUM: 3,
  MEDIUM_WELL: 4,
  WELL_DONE: 5,
};

export const RefrenceDoneLevel = {
  REFERENCE: 1,
};

export const DoneLevelmap = {
  DIY: DIYDoneLevel,
  SAUSAGE: SausageHameDoneLevel,
  HAM: SausageHameDoneLevel,
  PORK: PorkDoneLevel,
  BEEF: MeatDoneLevel,
  LAMB: MeatDoneLevel,
  VEAL: MeatDoneLevel,
};

export type Preset<FoodType extends Food> = {
  food?: FoodType;
  alarm?: {
    low?: number;
    high?: number;
  };
  doneLevel?: DoneLevel<FoodType>;
};

export class PresetState<Probe extends ProbeNumber> extends DeviceOpState<
  PresetStateName<Probe>,
  Preset<Food> | undefined
> {
  constructor(
    device: DeviceModel,
    private readonly probe: Probe,
    defaultState: Preset<Food> | undefined = undefined,
  ) {
    super(
      { opType: null },
      device,
      `${PresetStateName}${probe}`,
      defaultState,
      ParseOption.multiOp,
    );
  }

  parseMultiOpCommand(opCommands: number[][]): void {
    const reading = getProbeReading(opCommands, this.probe);
    const alarmHigh = total(reading.slice(2, 4));
    const alarmLow = total(reading.slice(4, 6));
    const food = Object.entries(FoodMap)
      .find(([_, code]) => code === reading[6])
      ?.at(0) as Food;
    const doneLevel: DoneLevel<Food> = Object.entries(
      DoneLevelmap[food] ?? RefrenceDoneLevel,
    )
      .find(([_, code]) => code === reading[8])
      ?.at(0) as DoneLevel<Food>;
    this.stateValue.next({
      food,
      alarm: {
        high: alarmHigh / 100,
        low: alarmLow / 100,
      },
      doneLevel,
    });
  }
}
