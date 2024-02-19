import { Optional } from '~ultimate-govee/common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';

export const SegmentCountStateName: 'segmentCount' = 'segmentCount' as const;
export type SegmentCountStateName = typeof SegmentCountStateName;

export type SegmentCount = {
  segments?: number;
  groups?: number[];
};

export class SegmentCountState extends DeviceOpState<
  SegmentCountStateName,
  Optional<number>
> {
  constructor(
    device: DeviceModel,
    opType: number = 0xaa,
    identifier: number[] = [0x11],
  ) {
    super({ opType, identifier }, device, SegmentCountStateName, undefined);
  }

  parseOpCommand(opCommand: number[]) {
    this.stateValue$.next(opCommand[2]);
  }
}
