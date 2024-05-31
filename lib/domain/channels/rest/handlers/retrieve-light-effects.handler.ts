import {
  CommandHandler,
  EventBus,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { GoveeDiyService, GoveeEffectService } from '~ultimate-govee-data';
import { AuthDataQuery, AuthState } from '../../../auth';
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
    private readonly diyApi: GoveeDiyService,
  ) {}

  async execute(command: RetrieveLightEffectsCommand): Promise<void> {
    const authData = await this.queryBus.execute<AuthDataQuery, AuthState>(
      new AuthDataQuery(),
    );
    if (!authData) {
      return;
    }

    const [effects, diys] = await Promise.all([
      this.api.getEffects(
        authData,
        command.device.model,
        command.device.goodsType,
        command.device.id,
      ),
      this.diyApi.getDiyEffects(
        authData,
        command.device.model,
        command.device.goodsType,
        command.device.id,
      ),
    ]);
    this.eventBus.publish(
      new LightEffectsReceivedEvent(
        command.device.id,
        effects ?? [],
        diys ?? [],
      ),
    );
  }
}
