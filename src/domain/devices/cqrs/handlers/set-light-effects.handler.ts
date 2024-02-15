import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SetLightEffectsCommand } from '../commands/set-light-effects.command';
import {
  LightEffectState,
  LightEffectStateName,
} from '../../states/light-effect.state';
import { DevicesService } from '../../devices.service';

@CommandHandler(SetLightEffectsCommand)
export class SetLightEffctsCommandHandler
  implements ICommandHandler<SetLightEffectsCommand, void>
{
  private readonly logger: Logger = new Logger(
    SetLightEffctsCommandHandler.name,
  );
  constructor(private readonly service: DevicesService) {}

  async execute(command: SetLightEffectsCommand): Promise<void> {
    const device = this.service.getDevice(command.deviceId);
    const state = device?.state<LightEffectState>(LightEffectStateName);
    if (!device || !state) {
      if (!device) {
        this.logger.log(`No device with id ${command.deviceId}`);
      } else {
        this.logger.log(
          `No state with name ${command.deviceId} ${LightEffectStateName}`,
        );
      }
      return;
    }
    command.effects
      .filter((effect) => !!effect.code)
      .forEach((effect) => {
        state.effects.set(effect.code!, effect);
      });
  }
}
