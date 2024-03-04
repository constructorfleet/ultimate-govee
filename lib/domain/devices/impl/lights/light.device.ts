import { Device, StateFactories } from '../../device';
import { DeviceStatesType } from '../../devices.types';
import { DeviceModel } from '../../devices.model';
import { EventBus, CommandBus } from '@nestjs/cqrs';
import {
  LightEffectState,
  LightEffectStateName,
} from '../../states/light-effect.state';

export abstract class LightDevice<
  States extends DeviceStatesType,
> extends Device<States> {
  constructor(
    device: DeviceModel,
    eventbus: EventBus,
    commandBus: CommandBus,
    stateFactories: StateFactories,
  ) {
    super(device, eventbus, commandBus, stateFactories);
    const effectState = this.state<LightEffectState>(LightEffectStateName);
    if (effectState === undefined) {
      return;
    }
    effectState.effects.delta$.subscribe(() => {
      this.next(this);
    });
  }
}
