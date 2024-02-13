import { chunk, total, Optional, asOpCode } from '@govee/common';
import { Effect, GoveeDeviceStateCommand } from '@govee/data';
import {
  DeviceOpState,
  SegmentCountState,
  DeviceState,
  ModeState,
  LightEffectState,
  LightEffect,
  StateCommandAndStatus,
} from '../../../states';
import { DeviceModel } from '../../../devices.model';
import { v4 as uuidv4 } from 'uuid';

export enum RGBICModes {
  SCENE = 4,
  MIC = 19,
  ADVANCED_COLOR = 10,
  SEGMENT_COLOR = 21,
  WHOLE_COLOR = 2,
}
export class SceneModeState extends LightEffectState {
  constructor(
    device: DeviceModel,
    opType: number = 0xaa,
    identifier: number[] = [0x05, RGBICModes.SCENE],
  ) {
    super(device, opType, identifier);
  }

  parseOpCommand(opCommand: number[]): void {
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

export const MicModeStateName: 'micMode' = 'micMode' as const;
export type MicModeStateName = typeof MicModeStateName;

export type MicMode = {
  micScene?: number;
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
    opType: number = 0xaa,
    identifier: number[] = [0x05, RGBICModes.MIC],
  ) {
    super({ opType, identifier }, device, MicModeStateName, {});
  }

  parseOpCommand(opCommand: number[]): void {
    const [micScene, sensitivity, calm, autoColor, red, green, blue] =
      opCommand.slice(1);
    this.stateValue.next({
      micScene,
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
      micScene: nextState.micScene ?? this.value.micScene ?? 0,
      sensitivity: nextState.sensitivity ?? this.value.sensitivity ?? 50,
      calm: (nextState.calm ?? this.value.calm) === true ? 0x01 : 0x00,
      autoColor:
        (nextState.autoColor ?? this.value?.autoColor) === true ? 0x01 : 0x00,
      color: {
        red: nextState.color?.red ?? this.value?.color?.red ?? 0,
        green: nextState.color?.green ?? this.value?.color?.green ?? 0,
        blue: nextState.color?.blue ?? this.value?.color?.blue ?? 0,
      },
    };
    return {
      command: {
        data: {
          command: [
            asOpCode(
              0x33,
              this.identifier!,
              next.micScene,
              next.sensitivity,
              next.calm,
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
              next.micScene,
              next.sensitivity,
              next.calm,
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

export const AdvancedColorModeStateName: 'advancedColorMode' =
  'advancedColorMode' as const;
export type AdvancedColorModeStateName = typeof AdvancedColorModeStateName;

export type AdvancedColorData = {
  diyEffectCode?: number;
};

export class AdvancedColorModeState extends DeviceOpState<
  AdvancedColorModeStateName,
  AdvancedColorData
> {
  constructor(
    deviceModel: DeviceModel,
    opType: number = 0xaa,
    identifier: number[] = [0x05, RGBICModes.ADVANCED_COLOR],
  ) {
    super(
      { opType, identifier },
      deviceModel,
      AdvancedColorModeStateName,
      {},
      'opCode',
    );
  }

  parseOpCommand(opCommand: number[]): void {
    this.stateValue.next({
      diyEffectCode: total(opCommand.slice(1, opCommand.indexOf(0x00)), true),
    });
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
    segmentCount: SegmentCountState,
    opType: number = 0xaa,
    identifier: number[] = [0xa5],
  ) {
    super({ opType, identifier }, device, SegmentColorModeStateName, []);
    segmentCount?.subscribe((event) => {
      if (event === undefined) {
        return;
      }
      this.segments = this.segments.slice(0, event);
      new Array(event - this.segments.length)
        .fill({} as Segment)
        .forEach((segment) => this.segments.push(segment));
    });
  }

  parseOpCommand(opCommand: number[]): void {
    const messageNumber = opCommand[0] - 1;
    const segmentCodes = chunk(opCommand.slice(1), 4).slice(0, 3);
    segmentCodes
      .map((segmentCode: number[], index): Segment => {
        const [brightness, red, green, blue] = segmentCode;
        return {
          id: messageNumber * 3 + index,
          brightness,
          color: {
            red,
            green,
            blue,
          },
        };
      })
      .forEach((segment, index) => {
        this.segments[messageNumber * 3 + index] = segment;
      });
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
          0x33,
          0x05,
          RGBICModes.SEGMENT_COLOR,
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
          0x33,
          0x05,
          RGBICModes.SEGMENT_COLOR,
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

export const WholeColorModeStateName: 'wholeColorMode' =
  'wholeColorMode' as const;
export type WholeColorModeStateName = typeof WholeColorModeStateName;

export type ColorData = {
  state?: {
    mode?: number;
    color?: {
      red: number;
      green: number;
      blue: number;
    };
  };
};

export type WholeColor = {
  red?: number;
  green?: number;
  blue?: number;
};

export class ColorModeState extends DeviceOpState<
  WholeColorModeStateName,
  WholeColor
> {
  constructor(
    device: DeviceModel,
    opType: number = 0xaa,
    identifier = [0x05, RGBICModes.WHOLE_COLOR],
  ) {
    super({ opType, identifier }, device, WholeColorModeStateName, {}, 'both');
  }

  parseState(data: ColorData): void {
    if (data?.state?.color !== undefined) {
      this.stateValue.next(data.state.color);
    } else {
      this.stateValue.next({});
    }
  }

  parseOpCommand(opCommand: number[]): void {
    this.stateValue.next({
      red: opCommand[1],
      green: opCommand[2],
      blue: opCommand[3],
    });
  }

  protected stateToCommand(state: WholeColor): Optional<StateCommandAndStatus> {
    return {
      command: [
        {
          command: 'colorwc',
          data: {
            color: {
              r: state.red ?? 0,
              g: state.green ?? 0,
              b: state.blue ?? 0,
            },
            colorTemInKelvin: 0,
          },
        },
        {
          data: {
            command: [
              asOpCode(
                0x33,
                this.identifier!,
                state.red ?? 0,
                state.green ?? 0,
                state.blue ?? 0,
              ),
            ],
          },
        },
      ],
      status: [
        {
          state: {
            color: {
              red: state.red ?? 0,
              green: state.green ?? 0,
              blue: state.blue ?? 0,
            },
            mode: RGBICModes.WHOLE_COLOR,
          },
        },
        {
          op: {
            command: [[state.red ?? 0, state.green ?? 0, state.blue ?? 0]],
          },
        },
      ],
    };
  }
}

export class RGBICActiveState extends ModeState {
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
        case RGBICModes.MIC:
          this.stateValue.next(
            this.modes.find((mode) => mode.name === MicModeStateName),
          );
          break;
        case RGBICModes.SEGMENT_COLOR:
          this.stateValue.next(
            this.modes.find((mode) => mode.name === SegmentColorModeStateName),
          );
          break;
        case RGBICModes.ADVANCED_COLOR:
          this.stateValue.next(
            this.modes.find((mode) => mode.name === AdvancedColorModeStateName),
          );
          break;
        case RGBICModes.WHOLE_COLOR:
          this.stateValue.next(
            this.modes.find((mode) => mode.name === WholeColorModeStateName),
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
      return;
    }

    return nextState.setState(nextState.value);
  }
}
