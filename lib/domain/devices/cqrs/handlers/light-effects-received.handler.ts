import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LightEffectsReceivedEvent } from '../events/light-effects-received.event';
import { DevicesService } from '../../devices.service';
import { Logger } from '@nestjs/common';
import { LightEffectState, LightEffectStateName } from '../../states';
import {
  DiyModeState,
  DiyModeStateName,
} from '~ultimate-govee-domain/devices/impl/lights/rgbic/rgbic-light.modes';

@EventsHandler(LightEffectsReceivedEvent)
export class LightEffectsReceivedEventHandler
  implements IEventHandler<LightEffectsReceivedEvent>
{
  private readonly logger: Logger = new Logger(
    LightEffectsReceivedEventHandler.name,
  );

  constructor(private readonly service: DevicesService) {}

  handle(event: LightEffectsReceivedEvent) {
    const device = this.service.getDevice(event.deviceId);
    if (device === undefined) {
      this.logger.log(`No device with id ${event.deviceId}`);
      return;
    }
    const state = device.state<LightEffectState>(LightEffectStateName);
    if (state === undefined) {
      this.logger.log(
        `No state with name ${LightEffectStateName} for ${device.name}`,
      );
      return;
    }
    event.effects
      .filter((effect) => !!effect.code)
      .forEach((effect) => {
        state.effects.set(effect.code!, effect);
      });
    const diyState = device.state<DiyModeState>(DiyModeStateName);
    if (state === undefined) {
      this.logger.log(
        `No state with name ${DiyModeStateName} for ${device.name}`,
      );
      return;
    }
    event.diys
      .filter((effect) => !!effect.code)
      .forEach((effect) => {
        if (effect.code === undefined) {
          return;
        }
        diyState?.effects.set(effect.code, effect);
      });
  }
}
