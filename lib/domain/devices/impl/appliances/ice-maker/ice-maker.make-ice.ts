import { DeviceModel } from '../../../devices.model';
import { DeviceState } from '../../../states';
import { IceMakerStatusState } from './ice-maker.status';
import { IceMakerStatus } from './types';

export const MakingIceStateName: 'makeIce' = 'makeIce' as const;
export type MakingIceStateName = typeof MakingIceStateName;

export class IceMakerMakingIceState extends DeviceState<
  MakingIceStateName,
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

  protected readonly stateToCommand = () => {
    return undefined;
  };

  setState(nextState: boolean | undefined) {
    if (nextState === undefined) {
      this.logger.warn('Value not provided, ignoring command');
      return [];
    }
    return this.statusState.setState(
      nextState ? IceMakerStatus.MAKING_ICE : IceMakerStatus.STANDBY,
    );
  }
}
