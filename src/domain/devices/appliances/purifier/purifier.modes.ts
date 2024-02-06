import { Optional, asOpCode, total } from '@govee/common';
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

  setState(nextState: Optional<number>) {
    if (nextState === undefined) {
      this.logger.warn('Fan speed not specified, ignoring command');
      return;
    }

    this.commandBus.next({
      data: {
        command: [
          asOpCode(0x33, this.identifier!, PurifierModes.MANUAL, 0, nextState),
        ],
      },
    });
  }
}

export const CustomModeStateName: 'customMode' = 'customMode' as const;
export type CustomModeStateName = typeof CustomModeStateName;

export type CustomProgram = {
  id: number;
  fanSpeed: number;
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
          fanSpeed: command[1 + 5 * i],
          duration: total([command[2 + 5 * i], command[3 + 5 * i]]),
          remaining: total([command[4 + 5 * i], command[5 + 5 * i]]),
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

  setState(nextState: CustomProgram | undefined) {
    if (nextState === undefined || nextState?.fanSpeed === undefined) {
      this.logger.warn('Fan speed not specified, ignoring command');
      return;
    }
    const newProgram: CustomProgram = {
      id: nextState.id ?? this.customModes.currentProgram?.id ?? 0,
      duration:
        nextState?.duration ?? this.customModes.currentProgram?.duration ?? 100,
      remaining:
        nextState?.remaining ??
        this.customModes.currentProgram?.duration ??
        100,
      fanSpeed:
        nextState?.fanSpeed ?? this.customModes?.currentProgram?.fanSpeed ?? 1,
    };

    const newPrograms: Record<number, CustomProgram> = {
      ...(this.customModes.programs ?? {
        0: {
          id: 0,
          duration: 100,
          remaining: newProgram.id > 0 ? 0 : 100,
          fanSpeed: 0,
        },
        1: {
          id: 1,
          duration: 100,
          remaining: newProgram.id > 1 ? 0 : 100,
          fanSpeed: 0,
        },
        2: {
          id: 2,
          duration: 32640,
          remaining: 32640,
          fanSpeed: 0,
        },
      }),
      [newProgram.id]: newProgram,
    };

    this.commandBus.next({
      data: {
        command: [
          asOpCode(
            0x33,
            this.identifier!,
            PurifierModes.PROGRAM,
            newProgram.id,
            ...[0, 1, 2].reduce((commands, program) => {
              commands.push(
                ...[
                  newPrograms[program].id,
                  newPrograms[program].fanSpeed,
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
    });
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

  setState(nextState: Optional<DeviceState<string, unknown>>) {
    if (nextState === undefined) {
      this.logger.warn('Next state is not specified, ignoring command');
      return;
    }

    nextState.setState(nextState.value);
  }
}
