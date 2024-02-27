import { Optional } from '~ultimate-govee-common';
import { BehaviorSubject } from 'rxjs';
import { DeviceModel } from '../devices.model';
import { DeviceOpState, DeviceState } from './device.state';
import { OpType } from '../../../common/op-code';

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

export type ModeIdMap = (
  state: ModeState,
) => Optional<DeviceState<string, any>>;
export const defaultModeIdMap: ModeIdMap = (
  state: ModeState,
): Optional<DeviceState<string, any>> => {
  return state.modes
    .map((mode) => mode as DeviceOpState<string, any>)
    .find((mode) =>
      state.activeIdentifier
        .getValue()
        ?.every((i, index) => mode.identifier?.at(index) === i),
    );
};

export class ModeState extends DeviceOpState<
  ModeStateName,
  Optional<DeviceState<string, unknown>>
> {
  readonly activeIdentifier = new BehaviorSubject<Optional<number[]>>(
    undefined,
  );
  readonly modes: DeviceState<string, any>[];
  protected readonly inline: boolean;
  get activeMode(): Optional<DeviceState<string, any>> {
    return this.identifierMap(this);
  }

  constructor(
    device: DeviceModel,
    modes: Optional<DeviceState<string, any>>[],
    opType: number = OpType.REPORT,
    identifier: number[] = [0x05],
    inline: boolean = false,
    private readonly identifierMap: ModeIdMap = defaultModeIdMap,
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
