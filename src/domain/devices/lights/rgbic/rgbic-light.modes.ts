import { chunk, total, Optional } from '@govee/common';
import {
  DeviceOpState,
  SegmentCountState,
  DeviceState,
  ModeState,
  LightEffectState,
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
      return;
    }

    this.activeEffectCode.next(total(opCommand.slice(1, 3), true));
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

export type Segment = {
  brightness?: number;
  color?: {
    red: number;
    green: number;
    blue: number;
  };
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
      .map((segmentCode: number[]): Segment => {
        const [brightness, red, green, blue] = segmentCode;
        return {
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

export class ColorModeState extends DeviceState<
  WholeColorModeStateName,
  WholeColor
> {
  constructor(device: DeviceModel) {
    super(device, WholeColorModeStateName, {});
  }

  parseState(data: ColorData): void {
    if (data?.state?.color !== undefined) {
      this.stateValue.next(data.state.color);
    }
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
}
