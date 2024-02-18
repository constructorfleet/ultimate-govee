import { DeviceModel } from '../../../devices.model';
import { DeviceOpState, WaterShortageStateName } from '../../../states';

export class IceMakerWaterEmpty extends DeviceOpState<
  WaterShortageStateName,
  boolean | undefined
> {
  constructor(device: DeviceModel) {
    super(
      {
        opType: 0xaa,
        identifier: [31, 6],
      },
      device,
      WaterShortageStateName,
      undefined,
      'both',
    );
  }

  parseOpCommand(opCommand: number[]): void {
    this.stateValue$.next(opCommand[0] === 0x01);
  }
}
