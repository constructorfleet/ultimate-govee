import { asOpCode } from '@govee/common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';

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
  constructor(device: DeviceModel, opType: number = 0xaa, identifier = 0x05) {
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

  setState(nextState: ColorRGB) {
    this.commandBus.next({
      command: 'color',
      data: {
        color: {
          r: nextState.red ?? 0,
          g: nextState.green ?? 0,
          b: nextState.blue ?? 0,
        },
      },
    });

    this.commandBus.next({
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
    });
  }
}
