import { DeviceModel } from '../../../devices.model';
import { DeviceOpState, DeviceState } from '../../../states/device.state';
import {
  OpType,
  Optional,
  asOpCode,
  total,
  chunk,
} from '~ultimate-govee-common';
import {
  LightEffect,
  LightEffectState,
  LightEffectStateName,
  ModeState,
  StateCommandAndStatus,
  // TimerStateName,
} from '../../../states';
import { Effect } from '~ultimate-govee-data';
// 35 -> ParserTimers
// 18 => WakeupInfo // AbsController (bool, byte[])
//  emab;ed
// end birghtness
// wake hour
// wake min
// repeat
// waketime
// default light
// color
// 17 => SLeepInfo // AbsController (bool, byte[])
//  enabled
// start brightness (0 -> 100)
// close time (0 -> 240)
// current time (0 -> 240)
// vice code
// voice volume
// default light
// color
// 7, 7 => parseint by 32 bytes
// 7, 8 =>
// brightness
//
// ambiant on/off
// consistent = 0, segment = 1
// Ambiant brightness
// Sync section #
// Pars Other Info // OtherDeviceController 8, [2,5,3, 1]
// 6 => reset
// 163 => ParserGradual bleutil.r[0]
// 169, 1 => EventVideoSensitivityResult ([2])
// 238, 48 => HDMI and light info notify
// 169 3 2 => HDMI selected
// 169,4, 7 =>
// __
// AI Ident: on
// Game model #

export const AmbiantStateName: 'ambiant' = 'ambiant' as const;
export type AmbiantStateName = typeof AmbiantStateName;

export enum BrightnessMode {
  CONSISTENT = 'CONSISTENT',
  SEGMENT = 'SEGMENT',
}

export type AmbiantData = {
  on?: boolean;
  brightnessMode?: BrightnessMode;
  brigness?: number;
  // Sync section #
  // Pars Other Info // OtherDeviceController 8, [2,5,3, 1]
};

export class AmbiantState extends DeviceOpState<AmbiantStateName, AmbiantData> {
  constructor(device: DeviceModel) {
    super(
      { opType: OpType.REPORT, identifier: [7, 8] },
      device,
      AmbiantStateName,
      {},
    );
  }

  parseOpCommand(opCommand: number[]): void {
    this.stateValue.next({
      on: opCommand[2] === 0x01,
      brightnessMode:
        opCommand[2] === 0x00
          ? BrightnessMode.CONSISTENT
          : BrightnessMode.SEGMENT,
      brigness: opCommand[3],
    });
  }
}

// export class TimerState extends DeviceOpState<TimerStateName, unknown> {
//   constructor(device: DeviceModel) {
//     super(
//       { opType: OpType.REPORT, identifier: [35] },
//       device,
//       TimerStateName,
//       {},
//     );
//   }

//   parseOpCommand(opCommand: number[]): void {
//     const [enabledType, hour, minute, repeat] = opCommand;
//   }
// }

// export const WakeUpStateName: 'wakeUp' = 'wakeUp' as const;
// export type WakeUpStatename = typeof WakeUpStateName;

// export type WakeUpData = {
//   enabled?: boolean;
//   endBrightness?: number;
//   wakeHour?: number;
//   wakeMinute?: number;
//   repeat?: boolean;
//   wakeTime?: number;
//   defaultLight?: boolean;
//   color?: {
//     red: number;
//     green: number;
//     blue: number;
//   };
// };

// export class WakeupState extends DeviceOpState<WakeUpStatename, WakeUpData> {
//   constructor(deviceModel: DeviceModel) {
//     super(
//       { opType: OpType.Report, identifier: [18] },
//       deviceModel,
//       WakeUpStateName,
//       {},
//     );
//   }

//   protected parseOpCommand(opCommand: number[]) {
//     const [
//       enabled,
//       endBrtghtness,
//       wakeHour,
//       wakeMinute,
//       repeat,
//       wakeTime,
//       defaultLight,
//       colorRed,
//       colorBlue,
//       colorGreen,
//     ] = opCommand;
//     this.stateValue.next({
//       enabled,
//       endBrtghtness,
//       wakeHour,
//       wakeMinute,
//       repeat,
//       wakeTime,
//       defaultLight,
//       color: {
//         red: colorRed,
//         green: colorGreen,
//         blue: colorBlue,
//       },
//     });
//   }
// }

// export const SleepStateName: 'wakeUp' = 'wakeUp' as const;
// export type SleepStatename = typeof SleepStateName;

// export type SleepData = {
//   enabled?: boolean;
//   endBrightness?: number;
//   wakeHour?: number;
//   wakeMinute?: number;
//   repeat?: boolean;
//   wakeTime?: number;
//   defaultLight?: boolean;
//   color?: {
//     red: number;
//     green: number;
//     blue: number;
//   };
// };

// export class WakeupState extends DeviceOpState<WakeUpStatename, WakeUpData> {
//   constructor(devicModel: DeviceModel) {
//     super(
//       { opType: OpType.Report, identifier: [18] },
//       WakeUpStateName,
//       device,
//       {},
//     );
//   }

//   protected parseOpCommand(opCommand: number) {
//     const [
//       enabled,
//       endBrtghtness,
//       wakeHour,
//       wakeMinute,
//       repeat,
//       wakeTime,
//       defaultLight,
//       colorRed,
//       colorBlue,
//       colorGreen,
//     ] = opCommand;
//     this.stateValue.next({
//       enabled,
//       endBrtghtness,
//       wakeHour,
//       wakeMinute,
//       repeat,
//       wakeTime,
//       defaultLight,
//       color: {
//         red: colorRed,
//         green: colorGreen,
//         blue: colorBlue,
//       },
//     });
//   }
// }

export enum SyncBoxModes {
  VIDEO = 0,
  MUSIC = 19,
  SCENE = 1,
  COLOR = 21,
  DIY = 10,
}

export const MicModeStateName: 'micMode' = 'micMode' as const;
export type MicModeStateName = typeof MicModeStateName;

const MicScenes = {
  Energetic: 5,
  Rhythm: 3,
  Spectrum: 4,
  Rolling: 6,
};

const MicSceneIds = Object.fromEntries(
  Object.entries(MicScenes).map(([k, v]) => [v, k]),
);

export type MicMode = {
  micScene?: string;
  micSceneId?: number;
  sensitivity?: number;
  calm?: boolean;
  autoColor?: boolean;
  color?: {
    red: number;
    blue: number;
    green: number;
  };
};

export class MicModeState extends DeviceOpState<MicModeStateName, MicMode> {
  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    identifier: number[] = [0x05, SyncBoxModes.MUSIC],
  ) {
    super({ opType, identifier }, device, MicModeStateName, {});
  }

  parseOpCommand(opCommand: number[]): void {
    /* trunk-ignore(eslint/no-unused-vars) */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const [micSceneId, sensitivity, calm, _, autoColor, red, green, blue] =
      opCommand;

    this.stateValue.next({
      micScene: MicSceneIds[micSceneId],
      micSceneId,
      sensitivity,
      calm: calm === 0x01,
      autoColor: autoColor === 0x01,
      color: {
        red,
        green,
        blue,
      },
    });
  }

  protected stateToCommand(
    nextState: MicMode,
  ): Optional<StateCommandAndStatus> {
    const next = {
      micScene: nextState.micScene,
      micSceneId: nextState.micSceneId,
      sensitivity: nextState.sensitivity ?? this.value.sensitivity,
      calm: (nextState.calm ?? this.value.calm) === true ? 0x01 : 0x00,
      autoColor:
        (nextState.autoColor ?? this.value?.autoColor) === true ? 0x01 : 0x00,
      color: {
        red: nextState.color?.red ?? this.value?.color?.red ?? 0,
        green: nextState.color?.green ?? this.value?.color?.green ?? 0,
        blue: nextState.color?.blue ?? this.value?.color?.blue ?? 0,
      },
    };
    if (next.micScene === undefined) {
      if (next.micSceneId !== undefined) {
        next.micScene = MicSceneIds[next.micSceneId];
      } else if (this.value.micSceneId !== undefined) {
        next.micScene = MicSceneIds[this.value.micSceneId];
      } else if (this.value.micScene !== undefined) {
        next.micScene = this.value.micScene;
      }
    } else if (next.micSceneId === undefined) {
      if (this.value.micSceneId !== undefined) {
        next.micSceneId = this.value.micSceneId;
      } else if (this.value.micScene !== undefined) {
        next.micSceneId = MicScenes[this.value.micScene];
      }
    }
    if (next.micScene === undefined || next.micSceneId === undefined) {
      this.logger.warn(
        'micScene and micSceneId are not supplied, ignoring command.',
      );
      return;
    }
    if (next.sensitivity === undefined) {
      this.logger.warn('sensitivity is not supplied, ignoring command.');
      return;
    }
    return {
      command: {
        data: {
          command: [
            asOpCode(
              OpType.COMMAND,
              this.identifier!,
              next.micSceneId,
              next.sensitivity,
              next.calm,
              0,
              next.autoColor,
              next.color.red,
              next.color.green,
              next.color.blue,
            ),
          ],
        },
      },
      status: {
        op: {
          command: [
            [
              next.micSceneId,
              next.sensitivity,
              next.calm,
              0,
              next.autoColor,
              next.color.red,
              next.color.green,
              next.color.blue,
            ],
          ],
        },
      },
    };
  }
}

export class SceneModeState extends LightEffectState {
  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    identifier: number[] = [0x05, SyncBoxModes.SCENE],
  ) {
    super(device, opType, identifier);
  }

  parseOpCommand(opCommand: number[]) {
    this.activeEffectCode.next(total(opCommand.slice(0, 2), true));
  }

  protected stateToCommand(
    nextState: LightEffect,
  ): Optional<StateCommandAndStatus> {
    if (nextState.code === undefined && nextState.name === undefined) {
      this.logger.warn(
        `Scene code or name is required to issue commands to ${this.constructor.name}`,
      );
      return undefined;
    }
    let effect: Partial<Effect> | undefined;
    if (nextState.code !== undefined) {
      effect = this.effects.get(nextState.code);
    }
    if (effect === undefined && nextState.name !== undefined) {
      effect = Array.from(this.effects.keys())
        .map((k) => {
          const r = this.effects.get(k);
          return r;
        })
        .find((e) => e?.name === nextState.name);
    }
    if (effect === undefined) {
      this.logger.warn(
        `Unable to locate effect with code ${nextState.code} or ${nextState.name}`,
      );
      return undefined;
    }

    return {
      command: {
        data: {
          command: effect.opCode,
        },
        cmdVersion: effect.cmdVersion,
      },
      status: {
        op: {
          command: [[(effect.code ?? 0) >> 8, (effect.code ?? 0) % 256]],
        },
      },
    };
  }
}

export const VideoModeStateName: 'videoMode' = 'videoMode' as const;
export type VideoModeStateName = typeof VideoModeStateName;

export type VideoData = {
  brightness?: number;
};

export class VideoModeState extends DeviceOpState<
  VideoModeStateName,
  VideoData
> {
  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    identifier: number[] = [0x05, SyncBoxModes.VIDEO],
  ) {
    super({ opType, identifier }, device, VideoModeStateName, {});
  }

  parseOpCommand(opCommand: number[]) {
    this.logger.log(opCommand);
    // this.activeEffectCode.next(total(opCommand.slice(0, 2), true));
  }

  protected stateToCommand(
    nextState: VideoData,
  ): Optional<StateCommandAndStatus> {
    this.logger.log(nextState);
    return undefined;
    // if (nextState.code === undefined && nextState.name === undefined) {
    //   this.logger.warn(
    //     `Scene code or name is required to issue commands to ${this.constructor.name}`,
    //   );
    //   return undefined;
    // }
    // let effect: Partial<Effect> | undefined;
    // if (nextState.code !== undefined) {
    //   effect = this.effects.get(nextState.code);
    // }
    // if (effect === undefined && nextState.name !== undefined) {
    //   effect = Array.from(this.effects.keys())
    //     .map((k) => {
    //       const r = this.effects.get(k);
    //       return r;
    //     })
    //     .find((e) => e?.name === nextState.name);
    // }
    // if (effect === undefined) {
    //   this.logger.warn(
    //     `Unable to locate effect with code ${nextState.code} or ${nextState.name}`,
    //   );
    //   return undefined;
    // }
    // return {
    //   command: {
    //     data: {
    //       command: effect.opCode,
    //     },
    //     cmdVersion: effect.cmdVersion,
    //   },
    //   status: {
    //     op: {
    //       command: [[(effect.code ?? 0) >> 8, (effect.code ?? 0) % 256]],
    //     },
    //   },
    // };
  }
}

export const DIYModeStateName: 'diyMode' = 'diyMode' as const;
export type DIYModeStateName = typeof DIYModeStateName;

export type DIYModeData = {
  code?: number;
  name?: string;
};

export class DIYModeState extends DeviceOpState<DIYModeStateName, DIYModeData> {
  constructor(device: DeviceModel) {
    super(
      { opType: OpType.REPORT, identifier: [5, SyncBoxModes.DIY] },
      device,
      DIYModeStateName,
      {},
    );
  }

  parseOpCommand(opCommand: number[]): void {
    const effectCode: number = total(opCommand.slice(0, 2));
    this.stateValue.next({
      code: effectCode,
    });
  }

  protected stateToCommand(
    state: DIYModeData,
  ): Optional<StateCommandAndStatus> {
    if (state.code === undefined) {
      this.logger.warn('diy code not supplied, ignoring command.');
      return;
    }
    return {
      command: [
        {
          data: {
            command: [
              asOpCode(
                OpType.COMMAND,
                this.identifier!,
                state.code % 255,
                state.code >> 8,
              ),
            ],
          },
        },
      ],
      status: [
        {
          op: {
            command: [[state.code % 255, state.code >> 8]],
          },
        },
      ],
    };
  }
}

export const SegmentColorModeStateName: 'segmentColorMode' =
  'segmentColorMode' as const;
export type SegmentColorModeStateName = typeof SegmentColorModeStateName;

type Color = {
  red: number;
  green: number;
  blue: number;
};

export type Segment = {
  id?: number;
  brightness?: number;
  color?: Color;
};

const indexToSegmentBits = (indices: number): number[] =>
  Number(indices)
    .toString(16)
    .split(/(.{2})/g)
    ?.filter((i) => i.length > 0)
    .map((i) => parseInt(`0x${i}`, 16));

type SegmentUpdate = {
  colorGroups: Record<string, number>;
  brightnessGroups: Record<string, number>;
};

export class SegmentColorModeState extends DeviceOpState<
  SegmentColorModeStateName,
  Segment[]
> {
  private segments: Segment[] = [];
  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    identifier: number[] = [0xa5],
  ) {
    super({ opType, identifier }, device, SegmentColorModeStateName, []);
  }

  parseMultiOpCommand(opCommands: number[][]): void {
    if (this.segments.length < opCommands.length * 3) {
      new Array(opCommands.length * 3 - this.segments.length)
        .fill({} as Segment)
        .forEach((segment) => this.segments.push(segment));
    } else {
      this.segments = this.segments.slice(0, opCommands.length * 3);
    }
    const parseOpCommand = (opCommand: number[]) => {
      const messageNumber = opCommand[0] - 1;
      const segmentCodes = chunk(opCommand.slice(1), 4).slice(0, 3);
      segmentCodes.forEach((segmentCode: number[], index) => {
        const id = messageNumber * 3 + index;
        const [brightness, red, green, blue] = segmentCode;
        this.segments[id] = {
          id: messageNumber * 3 + index,
          brightness,
          color: {
            red,
            green,
            blue,
          },
        };
      });
    };

    opCommands.forEach((opCommand) => parseOpCommand(opCommand));

    this.stateValue.next(this.segments);
  }

  protected stateToCommand(
    nextState: Segment[],
  ): Optional<StateCommandAndStatus> {
    const pad = (val: number): string => `000${val}`.slice(-3);
    const groups: SegmentUpdate = nextState.reduce(
      (group, segment) => {
        if (segment.id === undefined) {
          return group;
        }
        if (segment.color !== undefined) {
          const key = `${pad(segment.color.red)}${pad(segment.color.green)}${pad(segment.color.blue)}`;
          group.colorGroups[key] =
            (group.colorGroups[key] || 0) + (1 << segment.id);
        }
        if (segment.brightness !== undefined) {
          group.brightnessGroups[`${segment.brightness}`] =
            (group.brightnessGroups[`${segment.brightness}`] || 0) +
            (1 << segment.id);
        }
        return group;
      },
      {
        colorGroups: {},
        brightnessGroups: {},
      } as SegmentUpdate,
    );

    const colorCommands = Object.entries(groups.colorGroups).map(
      ([key, indicies]) => {
        const colorKeys = key
          .split(/(.{3})/g)
          .filter((i) => i.length > 0)
          .map((i) => Number.parseInt(i, 10));
        const color: Color = {
          red: colorKeys[0],
          green: colorKeys[1],
          blue: colorKeys[2],
        };
        const indexBytes = indexToSegmentBits(indicies);
        return asOpCode(
          OpType.COMMAND,
          0x05,
          SyncBoxModes.COLOR,
          1,
          color.red,
          color.green,
          color.blue,
          0,
          0,
          0,
          0,
          0,
          ...indexBytes,
        );
      },
    );

    const brightnessCommands = Object.entries(groups.brightnessGroups).map(
      ([key, indicies]) => {
        const indexBytes = indexToSegmentBits(indicies);
        return asOpCode(
          OpType.COMMAND,
          0x05,
          SyncBoxModes.COLOR,
          2,
          parseInt(key, 10),
          ...indexBytes,
        );
      },
    );

    return {
      command: {
        data: {
          command: [...colorCommands, ...brightnessCommands],
        },
      },
      status: {
        // TODO
      },
    };
  }
}

export class SyncBoxActiveState extends ModeState {
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
      0xaa,
      [0x05],
      true,
    );
    this.activeIdentifier?.subscribe((identifier) => {
      if (identifier === undefined) {
        return;
      }
      switch (identifier[0]) {
        case SyncBoxModes.MUSIC:
          this.stateValue.next(
            this.modes.find((mode) => mode.name === MicModeStateName),
          );
          break;
        case SyncBoxModes.COLOR:
          this.stateValue.next(
            this.modes.find((mode) => mode.name === SegmentColorModeStateName),
          );
          break;
        case SyncBoxModes.VIDEO:
          this.stateValue.next(
            this.modes.find((mode) => mode.name === VideoModeStateName),
          );
          break;
        case SyncBoxModes.SCENE:
          this.stateValue.next(
            this.modes.find((mode) => mode.name === LightEffectStateName),
          );
          break;
        case SyncBoxModes.DIY:
          this.stateValue.next(
            this.modes.find((mode) => mode.name === DIYModeStateName),
          );
          break;
        default:
          break;
      }
    });
  }

  setState(nextState: Optional<DeviceState<string, unknown>>) {
    if (nextState === undefined) {
      this.logger.warn('Next state not specified, ignoring command');
      return [];
    }

    return nextState.setState(nextState.value);
  }
}
