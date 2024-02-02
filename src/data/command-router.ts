import { Injectable } from '@nestjs/common';
import { IoTService } from './iot';

@Injectable()
export class CommandRouter {
  constructor(private readonly iot: IoTService) {}

  async publish(command: { topic: string; payload: object }) {
    await this.iot.send(command.topic, JSON.stringify(command.payload));
  }
}
