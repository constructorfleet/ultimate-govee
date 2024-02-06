import { Labelled } from '@govee/common';

type StatePayloads = {
  state: string;
};

export class SetStateCommand implements Labelled {
  label = () => `State ${this.stateName}`;

  constructor(readonly stateName: string) {}
}
