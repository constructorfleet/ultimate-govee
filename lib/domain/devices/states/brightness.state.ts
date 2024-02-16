import { asOpCode, Optional } from '@constructorfleet/ultimate-govee/common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState, StateCommandAndStatus } from './device.state';

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
    opType: number = 0xaa,
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
      this.stateValue.next(data.state.brightness);
    }
  }

  parseOpCommand(opCommand: number[]) {
    const [brightness] = opCommand.slice(0, 1);
    this.stateValue.next(brightness);
  }

  protected stateToCommand(
    nextState: Optional<number>,
  ): Optional<StateCommandAndStatus> {
    if (nextState === undefined) {
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
            command: [asOpCode(0x33, this.identifier!, nextState)],
          },
        },
      ],
    };
  }
}