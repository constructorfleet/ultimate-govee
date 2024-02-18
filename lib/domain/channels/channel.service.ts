import { EventBus } from '@nestjs/cqrs';
import { BehaviorSubject, filter, map, share } from 'rxjs';
import { ChannelState } from './channel.state';
import { Logger } from '@nestjs/common';

// const areSameConfig = <TConfig extends object>(
//   data1?: TConfig,
//   data2?: TConfig,
// ): boolean => {
//   if (data1 === undefined && data2 === undefined) {
//     return true;
//   }
//   if (data1 === undefined || data2 === undefined) {
//     return false;
//   }
//   return Object.entries(data1).every(([k, v]) => data2[k] === v);
// };

export abstract class ChannelService<
  TConfig extends object,
  Togglable extends boolean = false,
> {
  abstract readonly togglable: Togglable;
  abstract readonly name: string;

  protected logger: Logger = new Logger(this.constructor.name);

  private readonly state: ChannelState<TConfig> = {
    enabled: new BehaviorSubject<boolean | undefined>(undefined),
    config: new BehaviorSubject<TConfig | undefined>(undefined),
  };
  protected readonly onEnabledChanged$ = this.state.enabled.pipe(
    filter((e) => e !== undefined),
    map((e) => e!),
    share(),
  );

  protected readonly onConfigChanged$ = this.state.config.pipe(
    filter((config) => config !== undefined),
    map((config) => config! as TConfig),
    // distinctUntilChanged(
    //   (previous, current) => !areSameConfig(previous, current),
    // ),
    share(),
  );

  constructor(
    protected readonly eventBus: EventBus,
    initialState?: boolean,
    initialConfig?: TConfig,
  ) {
    this.state.enabled.next(initialState);
    this.state.config.next(initialConfig);
  }

  getConfig(): TConfig | undefined {
    return this.state.config.getValue();
  }

  setConfig(config: TConfig) {
    this.state.config.next(config);
  }

  setEnabled(enabled: boolean) {
    this.state.enabled.next(enabled);
  }

  get isEnabled(): boolean {
    return this.state.enabled.getValue() === true;
  }
}
