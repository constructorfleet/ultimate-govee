import { Optional } from '@govee/common';

export type Effect = {
  name: string;
  code: number;
  cmdVersion: number;
  type: number;
  opCode: Optional<number[][]>;
};
