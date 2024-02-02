import { total } from '@govee/common';
import { DeviceOpState, DeviceModel } from '@govee/domain';

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
    identifier: number = 0x05,
  ) {
    super({ opType, identifier }, device, SceneModeStateName, {});
  }

  parseOpCommand(opCommand: number[]): void {
    if (opCommand[0] !== 0x04) {
      return;
    }

    this.stateValue.next({
      sceneId: total(opCommand.slice(1, 3)),
      sceneParamId: total(opCommand.slice(3, 5)),
    });
  }
}
