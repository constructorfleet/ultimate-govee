import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { SenderService } from './sender/sender.service';
import { ReceiverService } from './receiver/receiver.service';
import { LANConfig } from './lan.config';

@Injectable()
export class LANDiscovery implements OnModuleInit {
  constructor(
    @Inject(LANConfig.KEY)
    private readonly config: ConfigType<typeof LANConfig>,
    private readonly receiver: ReceiverService,
    private sender: SenderService,
  ) {}

  async discoverDevices() {
    await this.receiver.bind();
    // this.sender.bind();
    await this.sender.scan();
  }

  onModuleInit() {}
}
