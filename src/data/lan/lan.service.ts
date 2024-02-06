import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { SenderService } from './sender/sender.service';
import { ReceiverService } from './receiver/receiver.service';
import { LANConfig } from './lan.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class LANDiscovery implements OnApplicationBootstrap {
  constructor(
    @Inject(LANConfig.KEY)
    private readonly config: ConfigType<typeof LANConfig>,
    private readonly receiver: ReceiverService,
    private sender: SenderService,
  ) {}

  async discoverDevices() {
    await this.sender.scan();
  }

  onApplicationBootstrap() {
    this.receiver.bind();
    this.sender.bind();
  }
}
