import { EventBus } from '@nestjs/cqrs';
import { BehaviorSubject, filter, map, tap } from 'rxjs';
import { ChannelState } from './channel.state';

const areSameConfig = <TConfig extends object>(
  data1?: TConfig,
  data2?: TConfig,
): boolean => {
  if (data1 === undefined && data2 === undefined) {
    return true;
  }
  if (data1 === undefined || data2 === undefined) {
    return false;
  }
  return Object.entries(data1).every(([k, v]) => data2[k] === v);
};

export abstract class ChannelService<
  TConfig extends object,
  TState extends ChannelState<TConfig>,
> {
  protected readonly state: TState = {} as TState;
  protected readonly config: BehaviorSubject<TConfig | undefined> =
    new BehaviorSubject<TConfig | undefined>(undefined);

  constructor(protected readonly eventBus: EventBus) {
    this.config
      .pipe(
        filter(
          (config) =>
            config !== undefined && !areSameConfig(this.state.config, config),
        ),
        map((config) => config! as TConfig),
        tap((config) => {
          this.state.config = config;
        }),
      )
      .subscribe((config) => this.onConfigChange(config));
  }

  abstract onConfigChange(config: TConfig);

  getConfig(): TConfig | undefined {
    return this.config.getValue();
  }

  setConfig(config: TConfig) {
    this.config.next(config);
  }
}
