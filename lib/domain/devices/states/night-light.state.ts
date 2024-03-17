import {
  OpType,
  Optional,
  asOpCode,
  isBetween,
  isTypeOf,
} from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';
import { ParseOption, StateCommandAndStatus } from './states.types';

export const NightLightStateName: 'nightLight' = 'nightLight' as const;
export type NightLightStateName = typeof NightLightStateName;

export type NightLight = {
  on?: boolean;
  brightness?: number;
};

export class NightLightState extends DeviceOpState<
  NightLightStateName,
  NightLight
> {
  protected parseOption: ParseOption = 'opCode';

  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    ...identifier: number[]
  ) {
    super({ opType, identifier }, device, NightLightStateName, {
      on: undefined,
      brightness: undefined,
    });
  }

  parseOpCommand(opCommand: number[]) {
    const [on, brightness] = opCommand.slice(0, 2);
    this.stateValue.next({
      on: on === 0x01,
      brightness,
    });
  }

  protected stateToCommand(state: NightLight): Optional<StateCommandAndStatus> {
    if (!isTypeOf(state?.on, 'boolean')) {
      this.logger.warn('On not included in state, ignoring command');
      return undefined;
    }
    if (!isBetween(state?.brightness, 0, 100)) {
      this.logger.warn('Brightness not included in state, ignoring command');
      return undefined;
    }
    return {
      status: {
        op: {
          command: [[state.on ? 0x01 : 0x00, state.brightness]],
        },
      },
      command: {
        data: {
          command: [
            asOpCode(
              OpType.COMMAND,
              ...this.identifier!,
              state.on ? 0x01 : 0x00,
              state.brightness,
            ),
          ],
        },
      },
    };
  }
}
