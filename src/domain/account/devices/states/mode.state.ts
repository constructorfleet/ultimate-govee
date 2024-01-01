import { BehaviorSubject } from 'rxjs';
import { DeviceModel } from '../devices.model';
import { DeviceOpState, DeviceState } from './device.state';

export const ModeStateName: 'mode' = 'mode' as const;
export type ModeStateName = typeof ModeStateName;

export type Modes<
  SubModes extends Record<string, DeviceState<string, object>>,
> = {
  active: DeviceState<string, object> | undefined;
  subModes: SubModes;
};

export type ModeType = {
  state?: {
    mode?: number;
  };
};

const definedStates = (
  states: (DeviceState<string, any> | undefined)[],
): DeviceState<string, any>[] =>
  states.filter((state) => state !== undefined) as DeviceState<string, any>[];

export abstract class ModeState extends DeviceOpState<
  ModeStateName,
  DeviceState<string, unknown> | undefined
> {
  protected activeIdentifier = new BehaviorSubject<number[] | undefined>(
    undefined,
  );
  protected readonly modes: DeviceState<string, any>[];

  constructor(
    device: DeviceModel,
    modes: (DeviceState<string, any> | undefined)[],
    opType: number = 0xaa,
    identifier: number = 0x05,
  ) {
    super({ opType, identifier }, device, ModeStateName, undefined);
    this.modes = definedStates(modes);
  }

  parseState(data: ModeType) {
    if (data?.state?.mode !== undefined) {
      this.activeIdentifier.next([data.state.mode]);
    }
  }

  parseOpCommand(opCommand: number[]) {
    const [identifier, ...value] = opCommand;
    if (identifier !== 0x00) {
      return;
    }
    this.activeIdentifier.next(value);
  }
}
