export type EffectSceneRule = {
  maxSoftVersion: string;
  minSoftVersion: string;
  maxHardVersion: string;
  minHardVersion: string;
  maxWifiSoftVersion: string;
  minWifiSoftVersion: string;
  maxWifiHardVersion: string;
  minWifiHardVersion: string;
};

export type LightEffect = {
  sceneParamId: number;
  sceneName: string;
  sceneParam: string;
  sceneCode: number;
  specialEffect: unknown[];
  cmdVersion: number;
  sceneType: number;
  diyEffectCode: unknown[];
  diyEffectStr: string;
  rules: unknown[];
};

export type EffectScene = {
  sceneId: number;
  iconUrls: string[];
  sceneName: string;
  sceneNameNew: Record<string, string>;
  sceneType: number;
  sceneCode: number;
  sceneCategoryId: number;
  scenesHint: string;
  scenesHintNew: Record<string, string>;
  rule: EffectSceneRule;
  voiceUrl: string;
  lightEffects: LightEffect[];
};

export type EffectCategory = {
  categoryId: number;
  categoryName: string;
  scenes: unknown[];
};

export type EffectListResponse = {
  categories: EffectCategory[];
};
