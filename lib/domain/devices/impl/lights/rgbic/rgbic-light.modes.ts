import {
  chunk,
  total,
  Optional,
  asOpCode,
  OpType,
  DeltaMap,
  hexStringToArray,
  hexToBase64,
} from '~ultimate-govee-common';
import { encode } from 'base64-arraybuffer';
import { Effect, DiyEffect } from '~ultimate-govee-data';
import {
  DeviceOpState,
  DeviceState,
  ModeState,
  LightEffectState,
  LightEffect,
  StateCommandAndStatus,
  ParseOption,
  ColorTempState,
  MeasurementData,
  ColorTempStateName,
} from '../../../states';
import { DeviceModel } from '../../../devices.model';
import { BehaviorSubject } from 'rxjs';
import { rebuildDiyOpCode } from '~ultimate-govee-data/api/diy/models/op-code';

export enum RGBICModes {
  SCENE = 4,
  MIC = 19,
  DIY = 10,
  SEGMENT_COLOR = 21,
  WHOLE_COLOR = 2,
}
export class SceneModeState extends LightEffectState {
  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    identifier: number[] = [0x05, RGBICModes.SCENE],
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
    if (effect?.opCode === undefined) {
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
    opType: number = OpType.REPORT,
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
              OpType.COMMAND,
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

export const DiyModeStateName: 'diyEffect' = 'diyEffect' as const;
export type DiyModeStateName = typeof DiyModeStateName;

export class DiyModeState extends DeviceOpState<
  DiyModeStateName,
  Partial<DiyEffect>
> {
  readonly effects: DeltaMap<number, DiyEffect> = new DeltaMap();
  readonly activeEffectCode: BehaviorSubject<number | undefined> =
    new BehaviorSubject<number | undefined>(undefined);

  constructor(device: DeviceModel) {
    super(
      { opType: OpType.REPORT, identifier: [5, 10] },
      device,
      DiyModeStateName,
      {},
    );
    this.activeEffectCode.subscribe((effectCode) => {
      if (effectCode !== undefined) {
        this.stateValue.next(this.effects.get(effectCode) ?? {});
      }
    });
    this.effects.delta$.subscribe(() => {
      this.stateValue.next(this.stateValue.getValue());
    });
  }

  parseOpCommand(opCommand: number[]) {
    const effectCode: number = total(opCommand.slice(0, 2), true);

    this.activeEffectCode.next(effectCode);
  }

  protected stateToCommand(
    state: Partial<DiyEffect>,
  ): Optional<StateCommandAndStatus> {
    let newEffect: DiyEffect | undefined;
    if (state?.name === undefined) {
      if (state?.code === undefined) {
        this.logger.warn('Missing name and code, ignoring command');
        return;
      }
      newEffect = Array.from(this.effects.entries()).find(
        ([_, effect]) => effect.code === state.code,
      )?.[1];
    } else {
      const effect = Array.from(this.effects.values()).find(
        (effect) => effect.name === state.name,
      );
      if (newEffect === undefined && effect === undefined) {
        this.logger.warn(
          'Unable to determing DIY effect from provide name or code, skipping command',
        );
        return;
      } else if (newEffect === undefined && effect !== undefined) {
        newEffect = effect;
      }
    }
    if (newEffect === undefined) {
      this.logger.warn(
        'Unable to determine effect from name or code, ignoring command',
      );
      return;
    }
    const commands = rebuildDiyOpCode(
      newEffect.code,
      newEffect.diyOpCodeBase64,
    )(this.identifier);
    console.dir({
      device: this.device.id,
      name: this.device.name,
      commands,
      base64: commands?.map(hexToBase64),
    });
    return {
      command: {
        type: 1,
        cmdVersion: 0,
        data: {
          command: commands,
        },
      },
      status: {
        op: {
          command: [[newEffect.code % 255, newEffect.code >> 8]],
        },
      },
    };
  }
}

export class ColorTemperatureModeState extends ColorTempState {
  constructor(device: DeviceModel) {
    super(device, OpType.REPORT, 5, 21, 1);
  }

  parseOpCommand(opCommand: number[]): void {
    this.stateValue.next({
      range: {
        min: 2000,
        max: 9000,
      },
      current: total(opCommand.slice(0, 2)),
    });
  }

  protected stateToCommand(
    nextState: MeasurementData,
  ): Optional<StateCommandAndStatus> {
    if (nextState.current === undefined) {
      this.logger.warn('color temperature not supplied, skipping command');
      return;
    }
    return {
      command: [
        // {
        //   data: {
        //     command: [
        //       asOpCode(
        //         OpType.COMMAND,
        //         ...this.identifier!,
        //         nextState.current >> 8,
        //         nextState.current % 256,
        //       ),
        //     ],
        //   },
        // },
        {
          command: 'colorTem',
          data: {
            colorTemInKelvin: nextState.current,
          },
        },
      ],
      status: [
        // {
        //   op: {
        //     command: [[nextState.current >> 8, nextState.current % 256]],
        //   },
        // },
        {
          state: {
            colorTemperature: {
              min: 2000,
              max: 9000,
              current: nextState.current,
            },
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
          OpType.COMMAND,
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
    opType: number = OpType.REPORT,
    identifier = [0x05, RGBICModes.WHOLE_COLOR],
  ) {
    super(
      { opType, identifier },
      device,
      WholeColorModeStateName,
      {},
      ParseOption.opCode.or(ParseOption.state),
    );
  }

  parseState(data: ColorData): void {
    if (data?.state?.color !== undefined) {
      this.stateValue.next(data.state.color);
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
                OpType.COMMAND,
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
          if (identifier.length > 10) {
            this.modes.find((mode) => mode.name === ColorTempStateName);
          } else {
            this.stateValue.next(
              this.modes.find(
                (mode) => mode.name === SegmentColorModeStateName,
              ),
            );
          }
          break;
        case RGBICModes.DIY:
          this.stateValue.next(
            this.modes.find((mode) => mode.name === DiyModeStateName),
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
      return [];
    }

    return nextState.setState(nextState.value);
  }
}
