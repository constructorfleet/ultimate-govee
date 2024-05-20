import { Labelled } from '~ultimate-govee-common';

export class OpenAPISubscribeCommand implements Labelled {
  label = () => `Subcribe to OpenAPI ${this.topic}`;
  constructor(readonly topic: string) {}
}
