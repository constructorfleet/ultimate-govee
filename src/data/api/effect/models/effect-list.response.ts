import { Expose, Transform, Type } from 'class-transformer';
import { GoveeAPIResponse } from '../../govee-api.models';
import { base64ToHex, chunk } from '../../../../common';

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

  @Expose({ name: 'diyEffect', toPlainOnly: true })
  get diyEffect(): number[][] | undefined {
    if (this.diyEffectStr === undefined) {
      return undefined;
    }
    return this.diyEffectStr.split('/').map(base64ToHex);
  }

  @Expose({ name: 'sceneEffectCode' })
  sceneEffectCode?: unknown[];

  @Expose({ name: 'sceneEffectStr' })
  sceneEffectStr?: string;

  @Expose()
  get chunk10(): number[][] | undefined {
    if (this.sceneEffectStr === undefined) {
      return undefined;
    }
    return chunk(base64ToHex(this.sceneEffectStr), 10);
  }

  @Expose()
  get chunk20(): number[][] | undefined {
    if (this.sceneEffectStr === undefined) {
      return undefined;
    }
    return chunk(base64ToHex(this.sceneEffectStr), 20);
  }

  @Expose({ name: 'rules' })
  rules?: unknown[];
}

export class EffectScene {
  @Expose({ name: 'sceneId' })
  id!: number;

  @Expose({ name: 'sceneParamId' })
  paramId!: number;

  @Expose({ name: 'iconUrls' })
  urls?: string[];

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

  @Expose({ name: 'diyEffectCode' })
  diyEffectCode?: unknown[];

  @Expose({ name: 'diyEffectStr' })
  diyEffectStr?: string;

  @Expose()
  get diyEffect(): number[][] | undefined {
    if (this.diyEffectStr === undefined) {
      return undefined;
    }
    return this.diyEffectStr.split(/.{10}/g).map(base64ToHex);
  }

  @Expose({ name: 'sceneEffectCode' })
  sceneEffectCode?: unknown[];

  @Expose({ name: 'sceneEffectStr' })
  sceneEffectStr?: string;

  @Expose()
  get sceneEffect(): number[][] | undefined {
    if (this.sceneEffectStr === undefined) {
      return undefined;
    }
    return chunk(base64ToHex(this.sceneEffectStr), 10);
  }

  @Expose()
  get sceneEffect20(): number[][] | undefined {
    if (this.sceneEffectStr === undefined) {
      return undefined;
    }
    return chunk(base64ToHex(this.sceneEffectStr), 20);
  }

  @Expose()
  get sceneEffect8(): number[][] | undefined {
    if (this.sceneEffectStr === undefined) {
      return undefined;
    }
    return chunk(base64ToHex(this.sceneEffectStr), 8);
  }
}

export class EffectCategory {
  @Expose({ name: 'name' })
  name!: string;

  @Expose({ name: 'scenes' })
  @Type(() => EffectScene)
  scenes!: EffectScene[];
}

export class EffectDisplay {
  @Expose({ name: 'displayCategory' })
  displayCategory?: number;

  @Expose({ name: 'isSupport' })
  @Transform(({ value }) => value === 1, { toClassOnly: true })
  isSupport?: boolean;

  @Expose({ name: 'supportSpeed' })
  @Transform(({ value }) => value === 1, { toClassOnly: true })
  supportSpeed?: boolean;

  @Expose({ name: 'sceneCategories' })
  @Type(() => EffectCategory)
  categories!: EffectCategory[];
}

export class EffectListResponse extends GoveeAPIResponse {
  @Expose({ name: 'data' })
  @Type(() => EffectDisplay)
  effectData!: EffectDisplay;
}
