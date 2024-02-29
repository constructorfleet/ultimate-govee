import { DeviceModel } from '../../../devices.model';
import { DeviceOpState, WaterShortageStateName } from '../../../states';
import { OpType } from '~ultimate-govee-common/op-code';

export class IceMakerWaterEmpty extends DeviceOpState<
  WaterShortageStateName,
  boolean | undefined
> {
  constructor(device: DeviceModel) {
    super(
      {
        opType: OpType.REPORT,
        identifier: [31, 6],
      },
      device,
      WaterShortageStateName,
      undefined,
      'both',
    );
  }

  parseOpCommand(opCommand: number[]): void {
    this.stateValue.next(opCommand[0] === 0x01);
  }
}
