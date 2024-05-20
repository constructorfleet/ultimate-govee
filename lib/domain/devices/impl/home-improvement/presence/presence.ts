import { DeviceModel } from '../../../devices.model';
import { EventBus, CommandBus } from '@nestjs/cqrs';
import { Device, StateFactories } from '../../../device';
import {
  ConnectedState,
  ConnectedStateName,
  PowerState,
  PowerStateName,
} from '../../../states';
import { DeviceFactory } from '../../../device.factory';
import { Injectable } from '@nestjs/common';
import { Optional } from '~ultimate-govee-common';
import {
  BiologicalPresenceState,
  BiologicalPresenceStateName,
  EnablePresenceState,
  EnablePresenceStateName,
  MMWavePresenceState,
  MMWavePresenceStateName,
  DetectionSettingsStateName,
  DetectionSettingsState,
} from './presence.states';

export const Presence: 'Presence' = 'Presence' as const;
export type Presence = typeof Presence;

const stateFactories: StateFactories = [
  (device) => new PowerState(device),
  (device) => new ConnectedState(device),
  (device) => new MMWavePresenceState(device),
  (device) => new BiologicalPresenceState(device),
  (device) => new EnablePresenceState(device),
  (device) => new DetectionSettingsState(device),
];

export class PresenceDevice
  extends Device<PresenceSensor>
  implements PresenceSensor
{
  static readonly deviceType: string = Presence;
  protected isDebug: boolean = true;
  get deviceType(): string {
    return PresenceDevice.deviceType;
  }
  constructor(device: DeviceModel, eventBus: EventBus, commandBus: CommandBus) {
    super(device, eventBus, commandBus, stateFactories);
  }

  get [PowerStateName](): Optional<PowerState> {
    return this.state(PowerStateName);
  }
  get [ConnectedStateName](): Optional<ConnectedState> {
    return this.state(ConnectedStateName);
  }
  get [MMWavePresenceStateName](): Optional<MMWavePresenceState> {
    return this.state(MMWavePresenceStateName);
  }
  get [BiologicalPresenceStateName](): Optional<BiologicalPresenceState> {
    return this.state(BiologicalPresenceStateName);
  }
  get [EnablePresenceStateName](): Optional<EnablePresenceState> {
    return this.state(EnablePresenceStateName);
  }
  get [DetectionSettingsStateName](): Optional<DetectionSettingsState> {
    return this.state(DetectionSettingsStateName);
  }
}

@Injectable()
export class PresenceFactory extends DeviceFactory<
  PresenceDevice,
  PresenceSensor
> {
  constructor() {
    super(PresenceDevice, {
      'Home Improvement': {
        Sensors: /.*presence.*/i,
      },
    });
  }
}
export type PresenceSensor = {
  [PowerStateName]: Optional<PowerState>;
  [ConnectedStateName]: Optional<ConnectedState>;
  [MMWavePresenceStateName]: Optional<MMWavePresenceState>;
  [BiologicalPresenceStateName]: Optional<BiologicalPresenceState>;
  [EnablePresenceStateName]: Optional<EnablePresenceState>;
  [DetectionSettingsStateName]: Optional<DetectionSettingsState>;
};
