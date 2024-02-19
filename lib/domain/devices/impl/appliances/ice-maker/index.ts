import { Type } from '@nestjs/common';
import { IceMakerDevice, IceMaker } from './ice-maker';
import { Device } from '../../../device';
import { BasketFullStateName } from './ice-maker.basket-full';
import { MakingIceStateName } from './ice-maker.make-ice';
import { NuggetSizeStateName } from './ice-maker.nugget-size';
import { ScheduledStartStateName } from './ice-maker.scheduled-start';
import { IceMakerStatusStateName } from './ice-maker.status';

export const Devices: Type<Device>[] = [IceMakerDevice];
export { IceMaker };
export const DeviceStates: string[] = [
  BasketFullStateName,
  MakingIceStateName,
  NuggetSizeStateName,
  ScheduledStartStateName,
  IceMakerStatusStateName,
];
