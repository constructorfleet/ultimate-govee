import { Labelled } from '~ultimate-govee/common';

export class IoTSubscribeCommand implements Labelled {
  label = () => `Subcribe to IoT ${this.topic}`;
  constructor(readonly topic: string) {}
}
