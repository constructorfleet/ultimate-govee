import { IceMaker } from './ice-maker';
import { BasketFullStateName } from './ice-maker.basket-full';
import { MakingIceStateName } from './ice-maker.make-ice';
import { NuggetSizeStateName } from './ice-maker.nugget-size';
import { ScheduledStartStateName } from './ice-maker.scheduled-start';
import { IceMakerStatusStateName } from './ice-maker.status';
import { IceMakerStatus, NuggetSize } from './types';

export {
  IceMaker,
  BasketFullStateName,
  MakingIceStateName,
  NuggetSizeStateName,
  ScheduledStartStateName,
  IceMakerStatusStateName,
  IceMakerStatus,
  NuggetSize,
};
export const DeviceStates: string[] = [
  BasketFullStateName,
  MakingIceStateName,
  NuggetSizeStateName,
  ScheduledStartStateName,
  IceMakerStatusStateName,
];
