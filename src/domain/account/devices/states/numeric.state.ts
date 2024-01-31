import { Subject } from 'rxjs';
import { Type } from '@nestjs/common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';

type StateValue = number | undefined;
type OpCodeParserFn = (
  opCommand: number[],
  stateValue: Subject<StateValue>,
) => void;
type StateParserFn = <StateData>(
  state: StateData,
  stateValue: Subject<StateValue>,
) => void;

export const NumericState = <StateName extends string>(
  stateName: StateName,
  opCodeParser: OpCodeParserFn | undefined = undefined,
  stateParser: StateParserFn | undefined = undefined,
): Type<DeviceOpState<StateName, StateValue>> => {
  class NumberState extends DeviceOpState<StateName, StateValue> {
    opCodeParser: OpCodeParserFn | undefined = opCodeParser;
    stateParser: StateParserFn | undefined = stateParser;

    constructor(
      device: DeviceModel,
      opType: number | undefined = undefined,
      identifier: number | undefined = undefined,
    ) {
      super({ opType, identifier }, device, stateName, undefined);
    }

    parseOpCommand(opCommand: number[]) {
      if (this.opCodeParser !== undefined) {
        this.opCodeParser(opCommand, this.stateValue);
      }
    }

    parseState(data: unknown): void {
      if (this.stateParser !== undefined) {
        this.stateParser(data, this.stateValue);
      }
    }
  }

  return NumberState;
};
