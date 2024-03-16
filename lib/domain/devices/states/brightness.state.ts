import { asOpCode, Optional } from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';
import { OpType } from '../../../common/op-code';
import { StateCommandAndStatus } from './states.types';

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
  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    identifier: number[] = [0x04],
  ) {
    super(
      { opType, identifier },
      device,
      BrightnessStateName,
      undefined,
      'both',
    );
  }

  parseState(data: BrightnessData) {
    if (data?.state?.brightness) {
      if (data.state.brightness < 0 || data.state.brightness > 100) {
        return;
      }
      this.stateValue.next(data.state.brightness);
    }
  }

  parseOpCommand(opCommand: number[]) {
    const [brightness] = opCommand.slice(0, 1);
    if (brightness < 0 || brightness > 100) {
      return;
    }
    this.stateValue.next(brightness);
  }

  protected stateToCommand(
    nextState: Optional<number>,
  ): Optional<StateCommandAndStatus> {
    if (nextState === undefined) {
      this.logger.warn('Brigntess not supplied, ignoreing command.');
      return;
    }
    if (nextState < 0 || nextState > 100) {
      this.logger.warn(
        'Brightness must be between 0 and 100, ignoring command.',
      );
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
