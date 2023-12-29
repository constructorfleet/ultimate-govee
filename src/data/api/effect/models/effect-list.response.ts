import { Expose, Type } from 'class-transformer';
import { GoveeAPIResponse } from '../../govee-api.models';

export class EffectSceneRule {
  @Expose({ name: 'maxSoftVersion' })
  maxSoftwareVersion?: string;

  @Expose({ name: 'minSoftVersion' })
  minSoftwareVersion?: string;

  @Expose({ name: 'maxHardVersion' })
  maxHardwareVersion?: string;

  @Expose({ name: 'minHardVersion' })
  minHardwareVersion?: string;

  @Expose({ name: 'maxWifiSoftVersion' })
  maxWiFiSoftwareVersion?: string;

  @Expose({ name: 'minWifiSoftVersion' })
  minWiFiSoftwareVersion?: string;

  @Expose({ name: 'maxWifiHardVersion' })
  maxWiFiHardwareVersion?: string;

  @Expose({ name: 'minWifiHardVersion' })
  minWiFiHardwareVersion?: string;
}

export class LightEffect {
  @Expose({ name: 'sceneParamId' })
  parameterId!: number;

  @Expose({ name: 'sceneName' })
  name!: string;

  @Expose({ name: 'sceneParam' })
  parameter!: string;

  @Expose({ name: 'sceneCode' })
  code!: number;

  @Expose({ name: 'specialEffect' })
  specialEffect?: unknown[];

  @Expose({ name: 'cmdVersion' })
  commandVersion!: number;

  @Expose({ name: 'sceneType' })
  sceneType!: number;

  @Expose({ name: 'diyEffectCode' })
  diyEffectCode?: unknown[];

  @Expose({ name: 'diyEffectStr' })
  diyEffectStr?: string;

  @Expose({ name: 'rules' })
  rules?: unknown[];
}

export class EffectScene {
  @Expose({ name: 'sceneId' })
  id!: number;

  @Expose({ name: 'iconUrls' })
  iconUrls?: string[];

  @Expose({ name: 'sceneName' })
  name!: string;

  @Expose({ name: 'sceneNameNew' })
  nameTranslations!: Record<string, string>;

  @Expose({ name: 'sceneType' })
  type!: number;

  @Expose({ name: 'sceneCode' })
  code!: number;

  @Expose({ name: 'sceneCategoryId' })
  categoryId!: number;

  @Expose({ name: 'scenesHing' })
  hint!: string;

  @Expose({ name: 'scenesHintNew' })
  hintTranslations!: Record<string, string>;

  @Expose({ name: 'rule' })
  rule?: EffectSceneRule;

  @Expose({ name: 'voiceUrl' })
  voiceUrl?: string;

  @Expose({ name: 'lightEffects' })
  @Type(() => LightEffect)
  lightEffects!: LightEffect[];
}

export class EffectCategory {
  @Expose({ name: 'categoryId' })
  id!: number;

  @Expose({ name: 'categoryName' })
  name!: string;

  @Expose({ name: 'scenes' })
  @Type(() => EffectScene)
  scenes!: EffectScene[];
}

export class EffectListResponse extends GoveeAPIResponse {
  @Expose({ name: 'categories' })
  @Type(() => EffectCategory)
  categories!: EffectCategory[];
}
