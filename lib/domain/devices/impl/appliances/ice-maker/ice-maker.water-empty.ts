import { DeviceModel } from '../../../devices.model';
import {
  DeviceOpState,
  ParseOption,
  WaterShortageStateName,
} from '../../../states';
import { OpType } from '~ultimate-govee-common/op-code';

export class IceMakerWaterEmpty extends DeviceOpState<
  WaterShortageStateName,
  boolean | undefined
> {
  protected parseOption: ParseOption = 'opCode';
  constructor(device: DeviceModel) {
    super(
      {
        opType: OpType.REPORT,
        identifier: [23],
      },
      device,
      WaterShortageStateName,
      undefined,
    );
  }

  parseOpCommand(opCommand: number[]): void {
    this.stateValue.next(opCommand[1] === 0x01);
  }
}
