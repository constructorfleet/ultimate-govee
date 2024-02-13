import { Subject } from 'rxjs';
import { Optional } from '@govee/common';
import { Type } from '@nestjs/common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';
import { GoveeDeviceStatus } from '@govee/data';

type StateValue = Optional<number>;
type OpCodeParserFn = (
  opCommand: number[],
  stateValue: Subject<StateValue>,
) => void;
type StateParserFn = <StateData extends GoveeDeviceStatus>(
  state: StateData,
  stateValue: Subject<StateValue>,
) => void;

export const NumericState = <StateName extends string>(
  stateName: StateName,
  opCodeParser: Optional<OpCodeParserFn> = undefined,
  stateParser: Optional<StateParserFn> = undefined,
): Type<DeviceOpState<StateName, StateValue>> => {
  class NumberState extends DeviceOpState<StateName, StateValue> {
    opCodeParser: Optional<OpCodeParserFn> = opCodeParser;
    stateParser: Optional<StateParserFn> = stateParser;

    constructor(
      device: DeviceModel,
      opType: Optional<number> = undefined,
      identifier: Optional<number[]> = undefined,
    ) {
      super(
        { opType, identifier },
        device,
        stateName,
        undefined,
        opCodeParser && stateParser
          ? 'both'
          : opCodeParser
            ? 'opCode'
            : 'state',
      );
    }

    parseOpCommand(opCommand: number[]) {
      if (this.opCodeParser !== undefined) {
        this.opCodeParser(opCommand, this.stateValue);
      }
    }

    parseState(data: GoveeDeviceStatus): void {
      if (this.stateParser !== undefined) {
        this.stateParser(data, this.stateValue);
      }
    }
  }

  return NumberState;
};
