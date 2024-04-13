import { DiyOpCodeBuilder } from './op-code';

export type DiyEffect = {
  name: string;
  code: number;
  cmdVersion: number;
  type: number;
  opCode: DiyOpCodeBuilder;
};
