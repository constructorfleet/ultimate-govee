import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { base64ToHex, Optional } from '~ultimate-govee-common';
import { GoveeAPIResponse } from '../../govee-api.models';
import { rebuildOpCode } from './op-code';

export class SpeedInfo {
  @Expose({ name: 'speedIndex' })
  index!: number;

  @Expose({ name: 'supSpeed' })
  supportsSpeed!: boolean;

  @Expose({ name: 'config' })
  config!: unknown;
}

export class LightEffectSpecialEffect {
  @Expose({ name: 'scenceParamId' })
  parameterId!: number;

  @Expose({ name: 'sceneParam' })
  opCodeBase64?: string;

  @Exclude()
  opCode(code: number): Optional<number[][] | undefined> {
    return rebuildOpCode(code, this.opCodeBase64);
  }

  @Expose({ name: 'cmdVersion' })
  cmdVersion!: number;

  @Expose({ name: 'supportSku' })
  supportedModels?: string[];

  @Expose({ name: 'speedInfo' })
  speedInfo?: SpeedInfo;
}

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
  @Expose({ name: 'scenceParamId' })
  parameterId!: number;

  @Expose({ name: 'scenceName' })
  name!: string;

  @Expose({ name: 'scenceParam' })
  opCodeBase64!: string;

  @Expose({ name: 'scenceOpCode' })
  get opCode(): Optional<number[][] | undefined> {
    return rebuildOpCode(this.code, this.opCodeBase64);
  }

  @Expose({ name: 'sceneCode' })
  code!: number;

  @Expose({ name: 'specialEffect' })
  specialEffect?: LightEffectSpecialEffect[];

  @Expose({ name: 'cmdVersion' })
  cmdVersion!: number;

  @Expose({ name: 'sceneType' })
  sceneType!: number;

  @Expose({ name: 'diyEffectCode' })
  diyOpCode?: unknown[];

  @Expose({ name: 'diyEffectStr' })
  diyOpCodeBase64?: string;

  @Expose({ name: 'diyEffect', toPlainOnly: true })
  get diyEffect(): Optional<number[][]> {
    if (this.diyOpCodeBase64 === undefined) {
      return undefined;
    }
    // Probably wrong
    return this.diyOpCodeBase64.split('/').map(base64ToHex);
  }

  @Expose({ name: 'rules' })
  rules?: unknown[];

  @Expose({ name: 'speedInfo' })
  speedInfo?: SpeedInfo;
}

export class EffectScene {
  @Expose({ name: 'sceneId' })
  id!: number;

  @Expose({ name: 'iconUrls' })
  urls?: string[];

  @Expose({ name: 'sceneName' })
  name!: string;

  @Expose({ name: 'sceneType' })
  type!: number;

  @Expose({ name: 'sceneCode' })
  code!: number;

  @Expose({ name: 'sceneCategoryId' })
  categoryId!: number;

  @Expose({ name: 'rule' })
  rule?: EffectSceneRule;

  @Expose({ name: 'lightEffects' })
  @Type(() => LightEffect)
  lightEffects!: LightEffect[];

  @Expose({ name: 'voiceUrl' })
  voiceUrl?: string;

  @Expose({ name: 'createTime' })
  createTimestamp!: number;
}

export class EffectCategory {
  @Expose({ name: 'categoryId' })
  id!: number;

  @Expose({ name: 'name' })
  name!: string;

  @Expose({ name: 'scenes' })
  @Type(() => EffectScene)
  scenes!: EffectScene[];
}

export class EffectData {
  @Expose({ name: 'supportSpeed' })
  @Transform(({ value }) => value === 1, { toClassOnly: true })
  supportSpeed?: boolean;

  @Expose({ name: 'categories' })
  @Type(() => EffectCategory)
  categories!: EffectCategory[];
}

export class EffectListResponse extends GoveeAPIResponse {
  @Expose({ name: 'data' })
  @Type(() => EffectData)
  effectData!: EffectData;
}
