import { Labelled } from '@constructorfleet/ultimate-govee/common';

export class IoTPublishCommand implements Labelled {
  label = () => `Publishing to ${this.topic}`;
  constructor(
    readonly commandId: string,
    readonly topic: string,
    readonly payload: object,
  ) {}
}
