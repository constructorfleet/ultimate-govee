import {
  CommandHandler,
  EventBus,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { GoveeEffectService } from '@govee/data';
import { AccountAuthData, AuthDataQuery } from '@govee/domain/auth';
import { LightEffectsReceivedEvent } from '@govee/domain/devices/cqrs';
import { RetrieveLightEffectsCommand } from '../commands/retrieve-light-effects.command';

@CommandHandler(RetrieveLightEffectsCommand)
export class RetrieveLightEffectsCommandHandler
  implements ICommandHandler<RetrieveLightEffectsCommand>
{
  constructor(
    private readonly eventBus: EventBus,
    private readonly queryBus: QueryBus,
    private readonly api: GoveeEffectService,
  ) {}
  async execute(command: RetrieveLightEffectsCommand): Promise<any> {
    const auth: AccountAuthData | undefined = await this.queryBus.execute(
      new AuthDataQuery(),
    );
    if (!auth) {
      return;
    }
    const effects = await this.api.getEffects(
      auth.oauth,
      command.device.model,
      command.device.goodsType,
      command.device.id,
    );

    this.eventBus.publish(
      new LightEffectsReceivedEvent(command.device.id, effects ?? []),
    );
  }
}
