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

@Injectable()
export class UltimateGoveeService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger: Logger = new Logger(UltimateGoveeService.name);
  constructor(
    @InjectGoveeConfig private readonly config: UltimateGoveeConfig,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {
    fromEvent(process, 'SIGINT')
      .pipe(takeUntil(fromEvent(process, 'SIGTERM')))
      .subscribe(() => this.shutdownBuses());
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
    this.connect(this.config.username, this.config.password);
  }

  onApplicationShutdown(): void {
    this.shutdownBuses();
  }
}
