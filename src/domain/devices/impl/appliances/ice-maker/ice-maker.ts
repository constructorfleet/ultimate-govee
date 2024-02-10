import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Device, StateFactories } from '../../../device';
import { DeviceFactory } from '../../../device.factory';
import { TemperatureState, HumidityState } from '../../../states';
import { DeviceModel } from '../../../devices.model';
import { IceMakerNuggetSizeState } from './ice-maker.nugget-size';
import { Injectable } from '@nestjs/common';
import { IceMakerScheduleState } from './ice-maker.schedule';

const stateFactories: StateFactories = [
  (device) => new IceMakerNuggetSizeState(device),
  (device) => new IceMakerScheduleState(device),
  (device) => new TemperatureState(device),
  (device) => new HumidityState(device),
];

/*
  "command": [
      [
        170,
        5,
        2,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        173
      ],
      [
        170,
        35,
        1,
        0,
        70,
        101,
        198,
        47,
        228,
        2,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        164
      ],
      [
        170,
        23,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        189
      ],
      [
        170,
        16,
        1,
        0,
        7,
        108,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        208
      ],
      [
        170,
        31,
        6,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        178
      ],
      [
        170,
        31,
        7,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        179
      ],
      [
        170,
        25,
        5,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        182
      ]
    ]

      07:00 ssmall nugget,
      ffirst 6:31 full basket 08:18
*/

export const IceMakerType: 'ice-maker' = 'ice-maker' as const;
export type IceMakerType = typeof IceMakerType;

export class IceMakerDevice extends Device {
  static readonly deviceType: IceMakerType = IceMakerType;
  constructor(device: DeviceModel, eventBus: EventBus, commandBus: CommandBus) {
    super(device, eventBus, commandBus, stateFactories);
  }
}

@Injectable()
export class IceMakerFactory extends DeviceFactory<IceMakerDevice> {
  constructor() {
    super(IceMakerDevice, {
      'Home Appliances': {
        Kitchen: /Ice Maker/,
      },
    });
  }
}
