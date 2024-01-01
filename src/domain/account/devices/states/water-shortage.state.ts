import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';

export const WaterShortageStateName: 'waterShortage' = 'waterShortage' as const;
export type WaterShortageStateName = typeof WaterShortageStateName;

export type WaterShortageType = {
  state?: {
    waterShortage?: boolean;
    sta?: {
      stc?: number[];
    };
  };
};

export class WaterShortageState extends DeviceOpState<
  WaterShortageStateName,
  boolean | undefined
> {
  constructor(
    device: DeviceModel,
    opType: number = 0xaa,
    identifier: number = 0x0a,
  ) {
    super({ opType, identifier }, device, WaterShortageStateName, undefined);
  }

  parseState(data: WaterShortageType) {
    if (data?.state?.waterShortage !== undefined) {
      this.stateValue.next(data.state.waterShortage);
    } else if (data?.state?.sta?.stc) {
      const { stc } = data.state.sta;
      if (stc.length > 0 && stc[0] === 0x06) {
        this.stateValue.next(stc[1] !== 0);
      }
    }
  }

  parseOpCommand(opCommand: number[]) {
    const waterShortage = opCommand[0] === 0x01;
    this.stateValue.next(waterShortage);
  }
}
