import { Optional, asOpCode } from '@constructorfleet/ultimate-govee/common';
import { DeviceModel } from '../../../devices.model';
import {
  ModeState,
  DeviceOpState,
  DeviceState,
  HumidityState,
  StateCommandAndStatus,
} from '../../../states';

enum HumidifierModes {
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
    identifier: number[] = [0x05, HumidifierModes.MANUAL],
  ) {
    super({ opType, identifier }, device, ManualModeStateName, undefined);
  }

  parseOpCommand(opCommand: number[]): void {
    const command = opCommand.slice(1);
    this.stateValue.next(command[command.indexOf(0x00) - 1]);
  }

  protected stateToCommand(nextState: number): Optional<StateCommandAndStatus> {
    if (nextState < 0) {
      this.logger.warn('Next state is less than 0, adjusting to 0');
      nextState = 0;
    } else if (nextState > 9) {
      this.logger.warn('Next state is greater than 9, adjusting to 9');
      nextState = 9;
    }
    return {
      status: {
        op: {
          command: [[nextState]],
        },
      },
      command: {
        data: {
          command: [
            asOpCode(0x33, ...(this.identifier as number[])!, nextState),
          ],
        },
      },
    };
  }
}

export const CustomModeStateName: 'customMode' = 'customMode' as const;
export type CustomModeStateName = typeof CustomModeStateName;

export type CustomProgram = {
  id: number;
  mistLevel: number;
  duration: number;
  remaining: number;
};

export type CustomMode = {
  currentProgramId?: number;
  programs?: Record<number, CustomProgram>;
  currentProgram?: CustomProgram;
};

export class CustomModeState extends DeviceOpState<
  CustomModeStateName,
  Optional<CustomProgram>
> {
  private customModes: CustomMode = {};
  constructor(
    device: DeviceModel,
    opType: number = 0xaa,
    identifier: number[] = [0x05, HumidifierModes.PROGRAM],
  ) {
    super({ opType, identifier }, device, CustomModeStateName, undefined);
  }

  parseOpCommand(opCommand: number[]): void {
    const command = opCommand.slice(1);
    const value: CustomMode = {
      currentProgramId: command[0],
      programs: [0, 1, 2].map(
        (i): CustomProgram => ({
          id: i,
          mistLevel: command[1 + 5 * i],
          duration: command[2 + 5 * i] * 255 + command[3 + 5 * i],
          remaining: command[4 + 5 * i] * 255 + command[5 + 5 * i],
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

  protected stateToCommand(
    nextState: Optional<CustomProgram>,
  ): Optional<StateCommandAndStatus> {
    if (nextState === undefined) {
      this.logger.warn('Program not specified, ignoring command');
      return;
    }
    const newProgram: CustomProgram = {
      id: nextState?.id ?? this.customModes?.currentProgram?.id ?? 0,
      duration:
        nextState?.duration ?? this.customModes?.currentProgram?.duration ?? 0,
      remaining:
        nextState?.remaining ??
        this.customModes?.currentProgram?.remaining ??
        100,
      mistLevel:
        nextState?.mistLevel ??
        this.customModes?.currentProgram?.mistLevel ??
        0,
    };

    const newPrograms: Record<number, CustomProgram> = {
      ...(this.customModes.programs ?? {
        0: {
          id: 0,
          duration: 100,
          remaining: newProgram.id > 0 ? 0 : 100,
          mistLevel: 0,
        },
        1: {
          id: 1,
          duration: 100,
          remaining: newProgram.id > 1 ? 0 : 100,
          mistLevel: 0,
        },
        2: {
          id: 2,
          duration: 32640,
          remaining: 32640,
          mistLevel: 0,
        },
      }),
      [newProgram.id]: newProgram,
    };

    return {
      command: {
        data: {
          command: [
            asOpCode(
              0x33,
              this.identifier!,
              // HumidifierModes.PROGRAM,
              newProgram.id,
              ...[0, 1, 2].reduce((commands, program) => {
                commands.push(
                  ...[
                    newPrograms[program].mistLevel,
                    Math.floor(newPrograms[program].duration / 255),
                    newPrograms[program].duration % 255,
                    Math.floor(newPrograms[program].remaining / 255),
                    newPrograms[program].remaining % 255,
                  ],
                );
                return commands;
              }, [] as number[]),
            ),
          ],
        },
      },
      status: {
        op: {
          command: [
            [
              newProgram.id,
              ...[0, 1, 2].reduce(
                (commands, program) => {
                  commands.push(
                    ...[
                      newPrograms[program].mistLevel,
                      Math.floor(newPrograms[program].duration / 255),
                      newPrograms[program].duration % 255,
                      undefined,
                      undefined,
                    ],
                  );
                  return commands;
                },
                [] as (number | undefined)[],
              ),
            ],
          ],
        },
      },
    };
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
    readonly humidityState?: HumidityState,
    opType: number = 0xaa,
    identifier: number[] = [0x05, HumidifierModes.AUTO],
  ) {
    super({ opType, identifier }, device, AutoModeStateName, {});
  }

  parseOpCommand(opCommand: number[]) {
    this.stateValue.next({
      targetHumidity: opCommand[0],
    });
  }

  protected stateToCommand(
    nextState: AutoMode,
  ): Optional<StateCommandAndStatus> {
    if (nextState.targetHumidity === undefined) {
      this.logger.warn('Target humidity not specified, ignoring state command');
      return undefined;
    }
    if (this.humidityState?.value?.range) {
      const { range } = this.humidityState.value;
      if (nextState.targetHumidity < (range.min ?? 0)) {
        this.logger.warn(
          `Target humidity ${nextState.targetHumidity} is less than minimum ${range.min ?? 0}, adjusting to minimum`,
        );
        nextState.targetHumidity = range.min ?? 0;
      } else if (nextState.targetHumidity > (range.max ?? 0)) {
        this.logger.warn(
          `Target humidity ${nextState.targetHumidity} is greater than maximum ${range.max ?? 100}, adjusting to maximum`,
        );
        nextState.targetHumidity = range.max ?? 100;
      }
    }
    return {
      command: {
        data: {
          command: [asOpCode(0x33, this.identifier!, nextState.targetHumidity)],
        },
      },
      status: {
        op: {
          command: [[nextState.targetHumidity]],
        },
      },
    };
  }
}

export class HumidifierActiveState extends ModeState {
  constructor(
    device: DeviceModel,
    states: Optional<DeviceState<string, any>>[],
  ) {
    super(
      device,
      states.filter((state) => state !== undefined) as DeviceState<
        string,
        any
      >[],
    );
    this.activeIdentifier?.subscribe((identifier) => {
      if (identifier === undefined) {
        return;
      }
      const modeIdentifier = identifier[identifier.indexOf(0x00) - 1];
      switch (modeIdentifier) {
        case HumidifierModes.MANUAL:
          this.stateValue.next(
            this.modes.find((mode) => mode.name === ManualModeStateName),
          );
          break;
        case HumidifierModes.PROGRAM:
          this.stateValue.next(
            this.modes.find((mode) => mode.name === CustomModeStateName),
          );
          break;
        case HumidifierModes.AUTO:
          this.stateValue.next(
            this.modes.find((mode) => mode.name === AutoModeStateName),
          );
          break;
        default:
          break;
      }
    });
  }

  setState(nextState: Optional<DeviceState<string, unknown>>) {
    if (nextState === undefined) {
      this.logger.warn('Next state is undefined, ignoring command');
      return [];
    }
    return nextState.setState(nextState.value);
  }
}
