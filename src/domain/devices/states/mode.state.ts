import { Optional } from '@govee/common';
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
  states: Optional<DeviceState<string, any>>[],
): DeviceState<string, any>[] =>
  states.filter((state) => state !== undefined) as DeviceState<string, any>[];

export class ModeState extends DeviceOpState<
  ModeStateName,
  Optional<DeviceState<string, unknown>>
> {
  readonly activeIdentifier = new BehaviorSubject<Optional<number[]>>(
    undefined,
  );
  readonly modes: DeviceState<string, any>[];
  protected readonly inline: boolean;

  constructor(
    device: DeviceModel,
    modes: Optional<DeviceState<string, any>>[],
    opType: number = 0xaa,
    identifier: number[] = [0x05],
    inline: boolean = false,
  ) {
    super({ opType, identifier }, device, ModeStateName, undefined, 'both');
    this.modes = definedStates(modes);
    this.inline = inline;
  }

  parseState(data: ModeType) {
    if (data?.state?.mode !== undefined) {
      this.activeIdentifier.next([data.state.mode]);
    }
  }

  parseOpCommand(opCommand: number[]) {
    if (this.inline) {
      this.activeIdentifier.next(opCommand);
      return;
    }
    const [identifier, ...value] = opCommand;
    if (identifier !== 0x00) {
      return;
    }
    this.activeIdentifier.next(value);
  }
}
