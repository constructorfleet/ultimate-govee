import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import MomentLib from 'moment';
import AsyncLock from 'semaphore-async-await';
import { Optional } from '~ultimate-govee-common';
import { PersistModule, PersistResult } from '~ultimate-govee-persist';
import { request } from '../../utils';
import { OAuthData } from '../account/models/account-client';
import { GoveeEffectConfig } from './govee-effect.config';
import {
  EffectCategory,
  EffectListResponse,
  EffectScene,
} from './models/effect-list.response';
import { Effect } from './models/effect.model';
import { SceneListResponse } from './models/scene-list.response';
import { AuthState } from '~ultimate-govee-domain';

type DeviceEffectsData = {
  lastUpdate: MomentLib.Moment;
  effects: Optional<Effect[]>;
};

@Injectable()
export class GoveeEffectService {
  private readonly logger: Logger = new Logger(GoveeEffectService.name);
  private readonly lock: AsyncLock = new AsyncLock(1);
  private readonly deviceEffectData: Record<string, DeviceEffectsData> = {};

  constructor(
    @Inject(GoveeEffectConfig.KEY)
    private readonly config: ConfigType<typeof GoveeEffectConfig>,
  ) {}

  @PersistResult({
    filename: 'govee.{1}.effects.json',
  })
  async getEffects(
    authState: AuthState,
    model: string,
    goodsType: number,
    deviceId: string,
  ): Promise<Optional<Effect[]>> {
    const oauth = authState?.accountAuth?.oauth;
    if (!oauth) {
      return [];
    }
    await this.lock.acquire();
    const deviceEffectData = this.deviceEffectData[model];
    try {
      if (
        deviceEffectData !== undefined &&
        deviceEffectData.lastUpdate.add(1, 'hour').isAfter(MomentLib())
      ) {
        this.logger.log('Last update within last hour, using previous result.');
        return deviceEffectData.effects;
      }

      const persisted = await PersistModule.getPersistedFile<
        Optional<Effect[]>
      >({
        filename: `govee.${model}.effects.json`,
      });

      if (persisted.data !== undefined && persisted.lastUpdate !== undefined) {
        if (persisted.lastUpdate.add(1, 'hour').isAfter(MomentLib())) {
          this.deviceEffectData[model] = {
            lastUpdate: persisted.lastUpdate,
            effects: persisted.data,
          };
          this.logger.log(
            'Last update within last hour, using previous result.',
          );
          return this.deviceEffectData[model].effects;
        }
      }

      const [deviceScenes, deviceEffects] = await Promise.all([
        this.getDeviceScenes(oauth, model, goodsType, deviceId),
        this.getDeviceEffects(oauth, model, goodsType, deviceId),
      ]);
      const effects = deviceEffects ?? [];
      // Add any scene not already defined
      effects.push(
        ...(deviceScenes ?? []).filter(
          (effect) => effects.find((e) => e.name === effect.name) === undefined,
        ),
      );
      this.deviceEffectData[model] = {
        lastUpdate: MomentLib(),
        effects,
      };
      return effects;
    } catch (error) {
      this.logger.error(
        'Unable to retrieve device light effects/scenes',
        error,
      );
      return deviceEffectData?.effects;
    } finally {
      this.lock.release();
    }
  }

  private async getDeviceEffects(
    oauth: OAuthData,
    model: string,
    goodsType: number,
    deviceId: string,
  ): Promise<Optional<Effect[]>> {
    try {
      this.logger.log(
        `Retrieving light effects for device ${model} ${deviceId} from Govee REST API`,
      );
      const response = await request(
        this.config.deviceEffectUrl,
        this.config.headers(oauth),
        {
          sku: model,
          goodsType,
          device: deviceId,
        },
      ).get(EffectListResponse);
      return (response.data as EffectListResponse).effectData.categories.reduce(
        (effects: Effect[], category: EffectCategory) => {
          category.scenes.forEach((scene: EffectScene) => {
            effects.push(
              ...scene.lightEffects.map((lightEffect): Effect => {
                const code = [0, undefined, null].includes(lightEffect.code)
                  ? scene.code
                  : lightEffect.code;
                return {
                  name: `${scene.name} ${lightEffect.name}`.trim(),
                  code,
                  opCode:
                    lightEffect.specialEffect
                      ?.find((s) => s.supportedModels?.includes(model) === true)
                      ?.opCode(code) ?? lightEffect.opCode,
                  type: lightEffect.sceneType,
                  cmdVersion: lightEffect.cmdVersion,
                };
              }),
            );
          });
          return effects;
        },
        [] as Effect[],
      );
    } catch (error) {
      this.logger.error('Unable to retrieve device light effects', error);
      return undefined;
    }
  }

  private async getDeviceScenes(
    oauth: OAuthData,
    model: string,
    goodsType: number,
    deviceId: string,
  ): Promise<Optional<Effect[]>> {
    try {
      this.logger.log(
        `Retrieving light scenes for device ${model} ${deviceId} from Govee REST API`,
      );
      const response = await request(
        this.config.sceneUrl,
        this.config.headers(oauth),
        {
          sku: model,
          goodsType,
          device: deviceId,
        },
      ).get(SceneListResponse);
      return (response.data as SceneListResponse).sceneData.categories.reduce(
        (effects: Effect[], category) => {
          effects.push(
            ...category.scenes.map(
              (scene): Effect => ({
                name: scene.name,
                code: scene.code,
                opCode: scene.opCode,
                type: scene.type,
                cmdVersion: 0,
              }),
            ),
          );
          return effects;
        },
        [] as Effect[],
      );
    } catch (error) {
      this.logger.error('Unable to retrieve device light effects', error);
      return undefined;
    }
  }
}
