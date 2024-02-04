import {
  CommandHandler,
  EventBus,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { EffectScene, GoveeEffectService } from '@govee/data';
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
    const effects = await this.api.getDeviceEffects(
      auth.oauth,
      command.device.model,
      command.device.goodsType,
      command.device.id,
    );
    const scenes = await this.api.getDeviceScenes(
      auth.oauth,
      command.device.model,
      command.device.goodsType,
      command.device.id,
    );

    const results =
      (
        effects?.effectData?.categories ?? effects?.effectData?.sceneCategories
      )?.reduce((acc, category) => {
        category.scenes.forEach((scene) => acc.push(scene));
        return acc;
      }, [] as EffectScene[]) ?? [];

    (scenes?.effectData?.categories ?? scenes?.effectData?.sceneCategories)
      ?.reduce((acc, category) => {
        category.scenes.forEach((scene) => acc.push(scene));
        return acc;
      }, [] as EffectScene[])
      ?.forEach((scene) => {
        if (results.find((r) => r.code === scene.code)) {
          return;
        }
        results.push(scene);
      });

    this.eventBus.publish(
      new LightEffectsReceivedEvent(command.device.id, results),
    );
  }
}
