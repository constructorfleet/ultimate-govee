import {
  CommandHandler,
  EventBus,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { GoveeEffectService } from '~ultimate-govee-data';
import { AuthDataQuery } from '../../../auth';
import { LightEffectsReceivedEvent } from '../../../devices/cqrs';
import { RetrieveLightEffectsCommand } from '../commands/retrieve-light-effects.command';

@CommandHandler(RetrieveLightEffectsCommand)
export class RetrieveLightEffectsCommandHandler
  implements ICommandHandler<RetrieveLightEffectsCommand, void>
{
  constructor(
    private readonly eventBus: EventBus,
    private readonly queryBus: QueryBus,
    private readonly api: GoveeEffectService,
  ) {}

  async execute(command: RetrieveLightEffectsCommand): Promise<void> {
    const authData = await this.queryBus.execute(new AuthDataQuery());
    if (authData === undefined) {
      return;
    }
    const effects = await this.api.getEffects(
      authData,
      command.device.model,
      command.device.goodsType,
      command.device.id,
    );
    this.eventBus.publish(
      new LightEffectsReceivedEvent(command.device.id, effects ?? []),
    );
  }
}
