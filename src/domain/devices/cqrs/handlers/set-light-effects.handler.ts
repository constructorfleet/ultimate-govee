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
  implements ICommandHandler<SetLightEffectsCommand>
{
  private readonly logger: Logger = new Logger(
    SetLightEffctsCommandHandler.name,
  );
  constructor(private readonly service: DevicesService) {}

  async execute(command: SetLightEffectsCommand): Promise<any> {
    const device = this.service.getDevice(command.deviceId);
    if (!device) {
      this.logger.log(`No device with id ${command.deviceId}`);
      return;
    }
    const state = device.state<LightEffectState>(LightEffectStateName);
    if (!state) {
      this.logger.log(
        `No state with name ${command.deviceId} ${LightEffectStateName}`,
      );
      return;
    }
    command.effects
      .filter((effect) => !!effect.code)
      .forEach((effect) => {
        state.effects.set(effect.code!, effect);
      });
  }
}
