import { Optional, asOpCode, OpType, isBetween } from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';
import { ParseOption, StateCommandAndStatus } from './states.types';

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
  protected parseOption: ParseOption = ParseOption.opCode.or(ParseOption.state);
  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    identifier = [0x05],
  ) {
    super({ opType, identifier }, device, ColorRGBStateName, {
      red: undefined,
      green: undefined,
      blue: undefined,
    });
  }

  parseState(data: ColorRGBData) {
    const { red, green, blue } = data?.state?.color ?? {};
    if (
      isBetween(red, 0, 255) &&
      isBetween(green, 0, 255) &&
      isBetween(blue, 0, 255)
    ) {
      this.stateValue.next({
        red,
        green,
        blue,
      });
    }
  }

  parseOpCommand(opCommand: number[]) {
    const [red, green, blue] = opCommand.slice(0, 3);
    if (
      isBetween(red, 0, 255) &&
      isBetween(green, 0, 255) &&
      isBetween(blue, 0, 255)
    ) {
      this.stateValue.next({
        red,
        green,
        blue,
      });
    }
  }

  protected stateToCommand(
    nextState: ColorRGB,
  ): Optional<StateCommandAndStatus> {
    const { red, green, blue } = nextState ?? {};
    if (
      !isBetween(red, 0, 255) ||
      !isBetween(green, 0, 255) ||
      !isBetween(blue, 0, 255)
    ) {
      this.logger.warn('Missing or invalid color, ignoring command');
      return;
    }
    return {
      status: [
        {
          state: {
            color: {
              red,
              green,
              blue,
            },
          },
        },
        {
          op: {
            command: [[0x02, red, green, blue]],
          },
        },
      ],
      command: [
        {
          command: 'color',
          data: {
            color: {
              red,
              green,
              blue,
            },
          },
        },
        {
          data: {
            command: [asOpCode(0x33, this.identifier!, 0x03, red, green, blue)],
          },
        },
      ],
    };
  }
}
