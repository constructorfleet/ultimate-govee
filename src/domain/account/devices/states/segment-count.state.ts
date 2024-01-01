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
  number | undefined
> {
  constructor(
    device: DeviceModel,
    opType: number = 0xaa,
    identifier: number = 0x11,
  ) {
    super({ opType, identifier }, device, SegmentCountStateName, undefined);
  }

  parseOpCommand(opCommand: number[]) {
    this.stateValue.next(opCommand[1]);
    // const [count, ...groups] = opCommand.slice(1);
    // this.stateValue.next({
    //   segments: count,
    //   groups: groups.slice(0, groups.indexOf(0x00)),
    // });
  }
}
