import { DeviceModel } from '@constructorfleet/ultimate-govee/domain/devices';
import { DeviceState } from '@constructorfleet/ultimate-govee/domain/devices/states';
import { IceMakerStatusState } from './ice-maker.status';
import { IceMakerStatus } from './types';

export const MakingIceStateName: 'makeIce' = 'makeIce' as const;
export type MakingIceStatename = typeof MakingIceStateName;

export class IceMakerMakingIceState extends DeviceState<
  MakingIceStatename,
  boolean | undefined
> {
  constructor(
    device: DeviceModel,
    readonly statusState: IceMakerStatusState,
  ) {
    super(device, MakingIceStateName, undefined);
    this.statusState.subscribe((status) => {
      if (status === undefined) {
        return;
      }
      this.stateValue.next(status === IceMakerStatus.MAKING_ICE);
    });
  }

  setState(nextState: boolean | undefined) {
    if (nextState === undefined) {
      this.logger.warn('Value not provided, ignoring command');
      return undefined;
    }
    return this.statusState.setState(
      nextState ? IceMakerStatus.MAKING_ICE : IceMakerStatus.STANDBY,
    );
  }
}
