import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PersistResult } from '@constructorfleet/ultimate-govee/persist';
import { Optional } from '@constructorfleet/ultimate-govee/common';
import { request } from '../../utils';
import {
  EffectCategory,
  EffectListResponse,
  EffectScene,
} from './models/effect-list.response';
import { GoveeEffectConfig } from './govee-effect.config';
import { OAuthData } from '../account/models/account-client';
import { Effect } from './models/effect.model';
import { SceneListResponse } from './models/scene-list.response';

@Injectable()
export class GoveeEffectService {
  private readonly logger: Logger = new Logger(GoveeEffectService.name);

  constructor(
    @Inject(GoveeEffectConfig.KEY)
    private readonly config: ConfigType<typeof GoveeEffectConfig>,
  ) {}

  async getEffects(
    oauth: OAuthData,
    model: string,
    goodsType: number,
    deviceId: string,
  ): Promise<Optional<Effect[]>> {
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
    return effects;
  }

  @PersistResult({
    path: 'persisted',
    filename: '{3}.effects.json',
    // transform: (data) => instanceToPlain(data),
  })
  async getDeviceEffects(
    oauth: OAuthData,
    model: string,
    goodsType: number,
    deviceId: string,
  ): Promise<Optional<Effect[]>> {
    try {
      this.logger.log(
        `Retrieving light effects for device ${deviceId} from Govee REST API`,
      );
      const response = await request(
        this.config.deviceEffectUrl,
        this.config.headers(oauth),
        {
          sku: model,
          goodsType,
          device: deviceId,
        },
      ).get(EffectListResponse, `persisted/${deviceId}.effects.raw.json`);
      return (response.data as EffectListResponse).effectData.categories.reduce(
        (effects: Effect[], category: EffectCategory) => {
          category.scenes.forEach((scene: EffectScene) => {
            effects.push(
              ...scene.lightEffects.map(
                (lightEffect): Effect => ({
                  name: `${scene.name} ${lightEffect.name}`.trim(),
                  code: [0, undefined, null].includes(lightEffect.code)
                    ? scene.code
                    : lightEffect.code,
                  opCode: lightEffect.opCode,
                  type: lightEffect.sceneType,
                  cmdVersion: lightEffect.cmdVersion,
                }),
              ),
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

  @PersistResult({
    path: 'persisted',
    filename: '{3}.scenes.json',
    // transform: (data) => instanceToPlain(data),
  })
  async getDeviceScenes(
    oauth: OAuthData,
    model: string,
    goodsType: number,
    deviceId: string,
  ): Promise<Optional<Effect[]>> {
    try {
      this.logger.log(
        `Retrieving light scenes for device ${deviceId} from Govee REST API`,
      );
      const response = await request(
        this.config.sceneUrl,
        this.config.headers(oauth),
        {
          sku: model,
          goodsType,
          device: deviceId,
        },
      ).get(SceneListResponse, `persisted/${deviceId}.scenes.raw.json`);
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
