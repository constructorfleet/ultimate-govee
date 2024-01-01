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
  SegmentCount
> {
  constructor(
    device: DeviceModel,
    opType: number = 0xaa,
    identifier: number = 0x11,
  ) {
    super({ opType, identifier }, device, SegmentCountStateName, {
      segments: undefined,
      groups: undefined,
    });
  }

  parseOpCommand(opCommand: number[]) {
    const [count, ...groups] = opCommand;
    this.stateValue.next({
      segments: count,
      groups: groups.slice(0, groups.indexOf(0x00)),
    });
  }
}
