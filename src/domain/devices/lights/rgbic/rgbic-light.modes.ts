import { chunk, total, Optional, asOpCode } from '@govee/common';
import { Effect } from '@govee/data';
import {
  DeviceOpState,
  SegmentCountState,
  DeviceState,
  ModeState,
  LightEffectState,
  LightEffect,
} from '../../states';
import { DeviceModel } from '../../devices.model';

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
    identifier: number = 0x05,
  ) {
    super(device, opType, identifier);
  }

  parseOpCommand(opCommand: number[]): void {
    if (opCommand[0] !== RGBICModes.SCENE) {
      this.activeEffectCode.next(undefined);
    }

    this.activeEffectCode.next(total(opCommand.slice(1, 3), true));
  }

  setState(nextState: LightEffect) {
    if (nextState.code === undefined && nextState.name === undefined) {
      this.logger.warn(
        `Scene code or name is required to issue commands to ${this.constructor.name}`,
      );
      return;
    }
    let effect: Partial<Effect> | undefined;
    if (nextState.code !== undefined) {
      effect = this.effects.get(nextState.code);
    }
    if (effect === undefined && nextState.name !== undefined) {
      effect = Array.from(this.effects.keys())
        .map((k) => this.effects.get(k))
        .find((e) => e?.name === nextState.name);
    }
    if (effect === undefined) {
      this.logger.warn(
        `Unable to locate effect with code ${nextState.code} or ${nextState.name}`,
      );
      return;
    }

    this.commandBus.next({
      data: {
        command: effect?.opCode,
      },
      cmdVersion: effect?.cmdVersion,
    });
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
    identifier: number = 0x05,
  ) {
    super({ opType, identifier }, device, MicModeStateName, {});
  }

  parseOpCommand(opCommand: number[]): void {
    if (opCommand[0] !== RGBICModes.MIC) {
      this.stateValue.next({});
      return;
    }
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

  setState(nextState: MicMode) {
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
    this.commandBus.next({
      data: {
        command: [
          asOpCode(
            0x33,
            this.identifier!,
            RGBICModes.MIC,
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
    });
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
    identifier: number = 0x05,
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
    if (opCommand[0] !== RGBICModes.ADVANCED_COLOR) {
      this.stateValue.next({});
      return;
    }

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
    identifier: number = 0xa5,
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

  setState(nextState: Segment[]) {
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
          this.identifier!,
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
          this.identifier!,
          RGBICModes.SEGMENT_COLOR,
          2,
          parseInt(key, 10),
          ...indexBytes,
        );
      },
    );

    this.commandBus.next({
      data: {
        command: [...colorCommands, ...brightnessCommands],
      },
    });
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
  constructor(device: DeviceModel, opType: number = 0xaa, identifier = 0x05) {
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
    if (opCommand[0] !== RGBICModes.WHOLE_COLOR) {
      return;
    }

    this.stateValue.next({
      red: opCommand[1],
      green: opCommand[2],
      blue: opCommand[3],
    });
  }

  protected stateToCommand(state: WholeColor): any {
    return {
      cmd: 'colorwc',
      data: {
        color: {
          r: state.red,
          g: state.green,
          b: state.blue,
        },
        colorTemInKelvin: 0,
      },
    };
  }

  setState(nextState: WholeColor) {
    this.commandBus.next({
      command: 'colorwc',
      data: {
        color: {
          r: nextState.red ?? 0,
          g: nextState.green ?? 0,
          b: nextState.blue ?? 0,
        },
      },
    });

    this.commandBus.next({
      command: 'pt',
      data: {
        opcode: 'mode',
        value: '2',
        val: '2',
        modeValue: '2',
      },
    });

    this.commandBus.next({
      data: {
        command: [
          asOpCode(
            0x33,
            this.identifier!,
            RGBICModes.WHOLE_COLOR,
            nextState.red ?? 0,
            nextState.green ?? 0,
            nextState.blue ?? 0,
          ),
        ],
      },
    });
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
      0x05,
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

    nextState.setState(nextState.value);
  }
}
