import { Optional, asOpCode } from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState, StateCommandAndStatus } from './device.state';
import { OpType } from '../../../common/op-code';

export const ColorRGBStateName: 'colorRGB' = 'colorRGB' as const;
export type ColorRGBStateName = typeof ColorRGBStateName;

export type ColorRGBData = {
  state?: {
    color?: {
      red?: number;
      green?: number;
      blue?: number;
    };
  };
};

export type ColorRGB = {
  red?: number;
  green?: number;
  blue?: number;
};

export class ColorRGBState extends DeviceOpState<ColorRGBStateName, ColorRGB> {
  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    identifier = [0x05],
  ) {
    super(
      { opType, identifier },
      device,
      ColorRGBStateName,
      {
        red: undefined,
        green: undefined,
        blue: undefined,
      },
      'both',
    );
  }

  parseState(data: ColorRGBData) {
    if (data?.state?.color) {
      this.stateValue.next({
        red: data.state.color.red,
        green: data.state.color.green,
        blue: data.state.color.blue,
      });
    }
  }

  parseOpCode(opCommand: number[]) {
    if (opCommand[0] !== 0x02) {
      return;
    }

    this.stateValue.next({
      red: opCommand[1],
      green: opCommand[2],
      blue: opCommand[3],
    });
  }

  protected stateToCommand(
    nextState: ColorRGB,
  ): Optional<StateCommandAndStatus> {
    return {
      status: [
        {
          state: {
            color: {
              red: nextState.red ?? 0,
              green: nextState.green ?? 0,
              blue: nextState.blue ?? 0,
            },
          },
        },
        {
          op: {
            command: [
              [
                0x02,
                nextState.red ?? 0,
                nextState.green ?? 0,
                nextState.blue ?? 0,
              ],
            ],
          },
        },
      ],
      command: [
        {
          command: 'color',
          data: {
            color: {
              r: nextState.red ?? 0,
              g: nextState.green ?? 0,
              b: nextState.blue ?? 0,
            },
          },
        },
        {
          data: {
            command: [
              asOpCode(
                0x33,
                this.identifier!,
                0x03,
                nextState.red ?? 0,
                nextState.green ?? 0,
                nextState.blue ?? 0,
              ),
            ],
          },
        },
      ],
    };
  }
}
