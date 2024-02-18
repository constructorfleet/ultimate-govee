import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { SetCredentialsCommand } from '@constructorfleet/ultimate-govee/domain/auth';
import { Password, Username } from '@constructorfleet/ultimate-govee/common';
import { Observable, fromEvent, takeUntil } from 'rxjs';
import {
  InjectGoveeConfig,
  UltimateGoveeConfig,
} from './ultimate-govee.config';
import { DeviceDiscoveredEvent } from './domain/devices/cqrs';
import { ChannelToggle, InjectChannels } from './domain';

@Injectable()
export class UltimateGoveeService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger: Logger = new Logger(UltimateGoveeService.name);
  constructor(
    @InjectGoveeConfig private readonly config: UltimateGoveeConfig,
    @InjectChannels private readonly channels: ChannelToggle,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {
    fromEvent(process, 'SIGINT')
      .pipe(takeUntil(fromEvent(process, 'SIGTERM')))
      .subscribe(() => this.shutdownBuses());
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

  async onApplicationBootstrap() {
    this.channel('ble').setEnabled(true);
    this.channel('ble').setConfig({ devices: undefined });
    this.channel('iot').setEnabled(true);
    this.connect(this.config.username, this.config.password);
  }

  onApplicationShutdown(): void {
    this.shutdownBuses();
  }
}
