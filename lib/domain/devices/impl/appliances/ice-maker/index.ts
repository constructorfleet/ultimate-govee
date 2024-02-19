import { Type } from '@nestjs/common';
import { IceMakerDevice } from './ice-maker';
import { Device } from '../../../device';
import { BasketFullStateName } from './ice-maker.basket-full';
import { MakingIceStateName } from './ice-maker.make-ice';
import { NuggetSizeStateName } from './ice-maker.nugget-size';
import { ScheduledStartStateName } from './ice-maker.scheduled-start';
import { IceMakerStatusStateName } from './ice-maker.status';
import {
  ActiveStateName,
  ConnectedStateName,
  PowerStateName,
} from '../../../states';

export const Devices: Type<Device>[] = [IceMakerDevice];
export type IceMakerStates = {
  [BasketFullStateName]: BasketFullStateName;
  [MakingIceStateName]: MakingIceStateName;
  [NuggetSizeStateName]: NuggetSizeStateName;
  [ScheduledStartStateName]: ScheduledStartStateName;
  [IceMakerStatusStateName]: IceMakerStatusStateName;
  [PowerStateName]: PowerStateName;
  [ConnectedStateName]: ConnectedStateName;
  [ActiveStateName]: ActiveStateName;
};
export const DeviceStates: string[] = [
  BasketFullStateName,
  MakingIceStateName,
  NuggetSizeStateName,
  ScheduledStartStateName,
  IceMakerStatusStateName,
];
