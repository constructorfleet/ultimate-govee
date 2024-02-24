import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { SetCredentialsCommand } from '~ultimate-govee-domain/auth';
import { Password, Username } from '~ultimate-govee-common';
import { Observable, interval } from 'rxjs';
import {
  InjectGoveeConfig,
  UltimateGoveeConfig,
} from './ultimate-govee.config';
import { DeviceDiscoveredEvent } from './domain/devices/cqrs';
import { IoTChannelService, BleChannelService } from './domain';
import { ModuleRef } from '@nestjs/core';
import { ChannelToggle } from '~ultimate-govee-domain/channels/channel.types';

@Injectable()
export class UltimateGoveeService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly channels: ChannelToggle;
  private readonly logger: Logger = new Logger(UltimateGoveeService.name);
  constructor(
    @InjectGoveeConfig private readonly config: UltimateGoveeConfig,
    private readonly moduleRef: ModuleRef,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {
    this.channels = {
      ble: moduleRef.get(BleChannelService, { strict: false }),
      iot: moduleRef.get(IoTChannelService, { strict: false }),
    };
    interval(10000).subscribe(() => Logger.flush());
  }

  channel<ChannelName extends keyof ChannelToggle>(
    name: ChannelName,
  ): ChannelToggle[ChannelName] {
    return this.channels[name];
  }

  get deviceDiscovered(): Observable<DeviceDiscoveredEvent> {
    return this.eventBus.pipe(ofType(DeviceDiscoveredEvent));
  }

  async connect(username: Username, password: Password) {
    this.logger.log('Issuing authenticate command');
    await this.commandBus.execute(
      new SetCredentialsCommand({
        username,
        password,
      }),
    );
  }

  private shutdownBuses() {
    this.commandBus.subject$.complete();
    this.eventBus.subject$.complete();
  }

  async onApplicationBootstrap() {}

  onModuleDestroy(): void {
    this.shutdownBuses();
    Logger.flush();
  }
}
