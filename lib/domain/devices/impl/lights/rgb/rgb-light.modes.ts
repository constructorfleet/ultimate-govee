import { total } from '@constructorfleet/ultimate-govee/common';
import { DeviceOpState } from '../../../states';
import { DeviceModel } from '../../../devices.model';

export enum RGBModes {
  SCENE = 4,
  MUSIC = 14,
}

export const SceneModeStateName: 'sceneMode' = 'sceneMode' as const;
export type SceneModeStateName = typeof SceneModeStateName;

export type SceneMode = {
  sceneId?: number;
  sceneParamId?: number;
};

export class SceneModeState extends DeviceOpState<
  SceneModeStateName,
  SceneMode
> {
  constructor(
    device: DeviceModel,
    opType: number = 0xaa,
    identifier: number[] = [0x05, 0x04],
  ) {
    super({ opType, identifier }, device, SceneModeStateName, {});
  }

  parseOpCommand(opCommand: number[]): void {
    this.stateValue$.next({
      sceneId: total(opCommand.slice(0, 2)),
      sceneParamId: total(opCommand.slice(2, 4)),
    });
  }
}
