import { Injectable } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Optional } from '~ultimate-govee-common';
import { DefaultFactory, Device, StateFactories } from '../../../device';
import { DeviceFactory } from '../../../device.factory';
import { DeviceModel } from '../../../devices.model';
import {
  ConnectedState,
  ConnectedStateName,
  PowerState,
  PowerStateName,
} from '../../../states';
import {
  BuzzerState,
  BuzzerStateName,
  EarlyWarningState,
  EarlyWarningStateName,
  PresetState,
  ProbeTempState,
  TemperatureUnitState,
  TemperatureUnitStateName,
} from './meat-thermometer.states';

export const MeatThermometer: 'MeatThermometer' = 'MeatThermometer' as const;
export type MeatThermometer = typeof MeatThermometer;

const stateFactories: StateFactories = [
  (device) => new PowerState(device),
  (device) => new ConnectedState(device),
  {
    [DefaultFactory]: [
      (device) => new BuzzerState(device),
      (device) => new TemperatureUnitState(device),
      (device) => new EarlyWarningState(device),
      (device) => new ProbeTempState(device, 1),
      (device) => new ProbeTempState(device, 2),
      (device) => new ProbeTempState(device, 3),
      (device) => new ProbeTempState(device, 4),
      (device) => new PresetState(device, 1),
      (device) => new PresetState(device, 2),
      (device) => new PresetState(device, 3),
      (device) => new PresetState(device, 4),
    ],
  },
];

export class MeatThermometerDevice
  extends Device<MeatThermometerSensor>
  implements MeatThermometerSensor
{
  static readonly deviceType: string = MeatThermometer;
  protected isDebug: boolean = true;

  get deviceType(): string {
    return MeatThermometerDevice.deviceType;
  }
  constructor(device: DeviceModel, eventBus: EventBus, commandBus: CommandBus) {
    super(device, eventBus, commandBus, stateFactories);
  }
  get probeTemp1(): Optional<ProbeTempState<1>> {
    return this.state('probeTemp1');
  }
  get probeTemp2(): Optional<ProbeTempState<2>> {
    return this.state('probeTemp2');
  }
  get probeTemp3(): Optional<ProbeTempState<3>> {
    return this.state('probeTemp3');
  }
  get probeTemp4(): Optional<ProbeTempState<4>> {
    return this.state('probeTemp4');
  }
  get preset1(): Optional<PresetState<1>> {
    return this.state('preset1');
  }
  get preset2(): Optional<PresetState<2>> {
    return this.state('preset2');
  }
  get preset3(): Optional<PresetState<3>> {
    return this.state('preset3');
  }
  get preset4(): Optional<PresetState<4>> {
    return this.state('preset4');
  }
  get [EarlyWarningStateName](): Optional<EarlyWarningState> {
    return this.state(EarlyWarningStateName);
  }
  get [TemperatureUnitStateName](): Optional<TemperatureUnitState> {
    return this.state(TemperatureUnitStateName);
  }

  get [PowerStateName](): Optional<PowerState> {
    return this.state(PowerStateName);
  }
  get [ConnectedStateName](): Optional<ConnectedState> {
    return this.state(ConnectedStateName);
  }
  get [BuzzerStateName](): Optional<BuzzerState> {
    return this.state(BuzzerStateName);
  }
}

@Injectable()
export class MeatThermometerFactory extends DeviceFactory<
  MeatThermometerDevice,
  MeatThermometerSensor
> {
  constructor() {
    super(MeatThermometerDevice, {
      'Home Improvement': {
        Kitchen: /.*wifi meat thermometer.*/i,
      },
    });
  }
}
export type MeatThermometerSensor = {
  [PowerStateName]: Optional<PowerState>;
  [ConnectedStateName]: Optional<ConnectedState>;
  [BuzzerStateName]: Optional<BuzzerState>;
  [EarlyWarningStateName]: Optional<EarlyWarningState>;
  probeTemp1: Optional<ProbeTempState<1>>;
  probeTemp2: Optional<ProbeTempState<2>>;
  probeTemp3: Optional<ProbeTempState<3>>;
  probeTemp4: Optional<ProbeTempState<4>>;
  preset1: Optional<PresetState<1>>;
  preset2: Optional<PresetState<2>>;
  preset3: Optional<PresetState<3>>;
  preset4: Optional<PresetState<4>>;
  [TemperatureUnitStateName]: Optional<TemperatureUnitState>;
};
