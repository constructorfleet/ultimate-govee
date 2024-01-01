import { Logger } from '@nestjs/common';
import { ModeState, DeviceOpState, DeviceState } from '../../../states';
import { DeviceModel } from '../../../devices.model';

enum HumidifierModes {
  MANUAL = 1,
  PROGRAM = 2,
  AUTO = 3,
}

export const ManualModeStateName: 'manualMode' = 'manualMode' as const;
export type ManualModeStateName = typeof ManualModeStateName;

export class ManualModeState extends DeviceOpState<
  ManualModeStateName,
  number | undefined
> {
  constructor(
    device: DeviceModel,
    opType: number = 0xaa,
    identifier: number = 0x05,
  ) {
    super({ opType, identifier }, device, ManualModeStateName, undefined);
  }

  parseOpCommand(opCommand: number[]): void {
    if (opCommand[0] !== HumidifierModes.MANUAL) {
      this.stateValue.next(opCommand[1]);
    }
  }
}

export const CustomModeStateName: 'customMode' = 'customMode' as const;
export type CustomModeStateName = typeof CustomModeStateName;

export type CustomProgram = {
  id: number;
  mistLevel: number;
  duration: number;
};

export type CustomMode = {
  currentProgramId?: number;
  programs?: Record<number, CustomProgram>;
  currentProgram?: CustomProgram;
};

export class CustomModeState extends DeviceOpState<
  CustomModeStateName,
  CustomProgram | undefined
> {
  private customModes: CustomMode = {};
  constructor(
    device: DeviceModel,
    opType: number = 0xaa,
    identifier: number = 0x05,
  ) {
    super({ opType, identifier }, device, CustomModeStateName, undefined);
  }

  parseOpCommand(opCommand: number[]): void {
    if (opCommand[0] !== HumidifierModes.PROGRAM) {
      return;
    }
    const command = opCommand.slice(1);
    const value: CustomMode = {
      currentProgramId: command[0],
      programs: [0, 1, 2].map(
        (i): CustomProgram => ({
          id: i,
          mistLevel: command[1 + 3 * i],
          duration: command[2 + 3 * i] * 255 + command[3 + 3 * i],
        }),
      ),
    };
    this.customModes = {
      ...value,
      currentProgram:
        value.currentProgramId !== undefined
          ? value.programs![value.currentProgramId]
          : undefined,
    };
    this.stateValue.next(this.customModes.currentProgram);
  }
}

export const AutoModeStateName: 'autoMode' = 'autoMode' as const;
export type AutoModeStateName = typeof AutoModeStateName;

export type AutoMode = {
  targetHumidity?: number;
};

export class AutoModeState extends DeviceOpState<AutoModeStateName, AutoMode> {
  constructor(
    device: DeviceModel,
    opType: number = 0xaa,
    identifier: number = 0x05,
  ) {
    super({ opType, identifier }, device, AutoModeStateName, {});
  }

  parseOpCommand(opCommand: number[]) {
    if (opCommand[0] !== HumidifierModes.AUTO) {
      return;
    }
    this.stateValue.next({
      targetHumidity: opCommand[1],
    });
  }
}

export class HumidifierActiveState extends ModeState {
  private readonly logger: Logger = new Logger(HumidifierActiveState.name);
  constructor(
    device: DeviceModel,
    states: (DeviceState<string, any> | undefined)[],
  ) {
    super(
      device,
      states.filter((state) => state !== undefined) as DeviceState<
        string,
        any
      >[],
    );
    this.activeIdentifier.subscribe((identifier) => {
      this.logger.log(identifier);
    });
  }
}
