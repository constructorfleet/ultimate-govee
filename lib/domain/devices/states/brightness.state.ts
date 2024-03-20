import { asOpCode, isBetween, Optional } from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';
import { OpType } from '../../../common/op-code';
import { ParseOption, StateCommandAndStatus } from './states.types';

export const BrightnessStateName: 'brightness' = 'brightness' as const;
export type BrightnessStateName = typeof BrightnessStateName;

export type BrightnessData = {
  state?: {
    brightness?: number;
  };
};

export class BrightnessState extends DeviceOpState<
  BrightnessStateName,
  Optional<number>
> {
  protected readonly;

  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    identifier: number[] = [0x04],
    parseOption: ParseOption = ParseOption.opCode.or(ParseOption.state),
  ) {
    super(
      { opType, identifier },
      device,
      BrightnessStateName,
      undefined,
      parseOption,
    );
  }

  parseState(data: BrightnessData) {
    const brightness = data?.state?.brightness;
    if (!isBetween(brightness, 0, 100)) {
      return;
    }
    this.stateValue.next(brightness);
  }

  parseOpCommand(opCommand: number[]) {
    const [brightness] = opCommand.slice(0, 1);
    if (!isBetween(brightness, 0, 100)) {
      return;
    }

    this.stateValue.next(brightness);
  }

  protected stateToCommand(
    nextState: Optional<number>,
  ): Optional<StateCommandAndStatus> {
    if (!isBetween(nextState, 0, 100)) {
      this.logger.warn('Invalid or missing state, ignoring command.');
      return;
    }

    return {
      status: [
        {
          state: {
            brightness: nextState,
          },
        },
        {
          op: {
            command: [[nextState]],
          },
        },
      ],
      command: [
        {
          command: 'brightness',
          data: {
            val: nextState,
          },
        },
        {
          data: {
            command: [asOpCode(OpType.COMMAND, this.identifier!, nextState)],
          },
        },
      ],
    };
  }
}
