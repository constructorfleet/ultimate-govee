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
import { concatMap, filter, from, map } from 'rxjs';

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
    from(this.queryBus.execute(new AuthDataQuery()))
      .pipe(
        filter((auth) => auth !== undefined),
        map((auth) => auth!),
        concatMap((auth) =>
          from(
            this.api.getEffects(
              auth.oauth,
              command.device.model,
              command.device.goodsType,
              command.device.id,
            ),
          ).pipe(
            map(
              (effects) =>
                new LightEffectsReceivedEvent(command.device.id, effects ?? []),
            ),
          ),
        ),
      )
      .subscribe((event) => this.eventBus.publish(event));
  }
}
