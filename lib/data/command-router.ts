import { Injectable } from '@nestjs/common';
import { IoTService } from './iot';
import stringify from 'json-stringify-safe';

@Injectable()
export class CommandRouter {
  constructor(private readonly iot: IoTService) {}

  async publish(command: { topic: string; payload: object }) {
    await this.iot.send(command.topic, stringify(command.payload));
  }
}
