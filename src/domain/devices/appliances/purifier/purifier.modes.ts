import { Optional } from '@govee/common';
import { DeviceModel } from '../../devices.model';
import { ModeState, DeviceOpState, DeviceState } from '../../states';
import { AutoModeStateName } from '../humidifier/humidifier.modes';

enum PurifierModes {
  MANUAL = 1,
  PROGRAM = 2,
  AUTO = 3,
}

export const ManualModeStateName: 'manualMode' = 'manualMode' as const;
export type ManualModeStateName = typeof ManualModeStateName;

export class ManualModeState extends DeviceOpState<
  ManualModeStateName,
  Optional<number>
> {
  constructor(
    device: DeviceModel,
    opType: number = 0xaa,
    identifier: number = 0x05,
  ) {
    super({ opType, identifier }, device, ManualModeStateName, undefined);
  }

  parseOpCommand(opCommand: number[]): void {
    if (opCommand[0] !== PurifierModes.MANUAL) {
      return;
    }
    const command = opCommand.slice(1);
    this.stateValue.next(command[command.indexOf(0x00) - 1]);
  }
}

export const CustomModeStateName: 'customMode' = 'customMode' as const;
export type CustomModeStateName = typeof CustomModeStateName;

export type CustomProgram = {
  id: number;
  fanSpeed: number;
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
    if (opCommand[0] !== PurifierModes.PROGRAM) {
      return;
    }
    const command = opCommand.slice(1);
    const value: CustomMode = {
      currentProgramId: command[0],
      programs: [0, 1, 2].map(
        (i): CustomProgram => ({
          id: i,
          fanSpeed: command[1 + 3 * i],
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

export class PurifierActiveMode extends ModeState {
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
      if (identifier === undefined) {
        return;
      }
      switch (identifier[0]) {
        case PurifierModes.MANUAL:
          this.stateValue.next(
            this.modes.find((mode) => mode.name === ManualModeStateName),
          );
          break;
        case PurifierModes.PROGRAM:
          this.stateValue.next(
            this.modes.find((mode) => mode.name === CustomModeStateName),
          );
          break;
        case PurifierModes.AUTO:
          this.stateValue.next(
            this.modes.find((mode) => mode.name === AutoModeStateName),
          );
          break;
        default:
          break;
      }
    });
  }
}
