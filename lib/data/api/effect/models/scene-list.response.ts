import { Expose, Transform, Type } from 'class-transformer';
import { Optional } from '~ultimate-govee-common';
import { GoveeAPIResponse } from '../../govee-api.models';
import { rebuildOpCode } from './op-code';

const TransformBoolean = Transform(
  ({ value }) => [1, 'true', true].includes(value),
  { toClassOnly: true },
);

export class SceneSpeedInfo {
  @Expose({ name: 'config' })
  config?: string;

  @Expose({ name: 'speedIndex' })
  index?: number;

  @Expose({ name: 'supSpeed' })
  @TransformBoolean
  supportsSpeed?: boolean;
}

export class Scene {
  @Expose({ name: 'sceneId' })
  id!: number;

  @Expose({ name: 'sceneParamId' })
  parameterId!: number;

  @Expose({ name: 'iconUrls' })
  iconUrls?: string[];

  @Expose({ name: 'sceneName' })
  name!: string;

  @Expose({ name: 'sceneType' })
  type!: number;

  @Expose({ name: 'sceneCode' })
  code!: number;

  @Expose({ name: 'sceneEffectStr' })
  opCodeBase64?: string;

  @Expose({ name: 'sceneEffect' })
  get opCode(): Optional<number[][]> {
    return rebuildOpCode(this.code, this.opCodeBase64);
  }

  @Expose({ name: 'sceneDif4Device' })
  dif4Device?: number;

  @Expose({ name: 'diyEffectCode' })
  diyOpCode?: number;

  @Expose({ name: 'diyEffectStr' })
  diyOpCodeBase64?: string;

  @Expose({ name: 'rules' })
  rules?: unknown[];

  @Expose({ name: 'speedInfo' })
  @Type(() => SceneSpeedInfo)
  speedInfo?: SceneSpeedInfo;
}

export class SceneCategory {
  @Expose({ name: 'categoryName' })
  name!: string;

  @Expose({ name: 'scenes' })
  @Type(() => Scene)
  scenes!: Scene[];
}

export class SceneData {
  @Expose({ name: 'displayCategory' })
  displayCategory!: number;

  @Expose({ name: 'sceneCategories' })
  @Type(() => SceneCategory)
  categories!: SceneCategory[];

  @Expose({ name: 'isSupport' })
  @TransformBoolean
  isSUpported?: boolean;

  @Expose({ name: 'supportSpeed' })
  @TransformBoolean
  supportsSpeed?: boolean;
}

export class SceneListResponse extends GoveeAPIResponse {
  @Expose({ name: 'data' })
  @Type(() => SceneData)
  sceneData!: SceneData;
}
