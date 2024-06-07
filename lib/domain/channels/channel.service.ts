import { Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  map,
  share,
} from 'rxjs';
import { ChannelState } from './channel.types';

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
  Togglable extends boolean = false,
> implements OnApplicationBootstrap
{
  abstract readonly togglable: Togglable;
  abstract readonly name: string;

  protected logger: Logger = new Logger(this.constructor.name);

  private readonly state: ChannelState<TConfig> = {
    enabled: new BehaviorSubject<boolean | undefined>(undefined),
    config: new BehaviorSubject<TConfig | undefined>(undefined),
  };
  protected readonly onEnabledChanged$ = this.state.enabled.pipe(
    map((e) => e === true),
    share(),
  );

  protected readonly onConfigChanged$ = this.state.config.pipe(
    filter((config) => config !== undefined),
    map((config) => config! as TConfig),
    distinctUntilChanged(
      (previous, current) => !areSameConfig(previous, current),
    ),
    share(),
  );

  constructor(
    protected readonly eventBus: EventBus,
    private readonly initialState?: boolean,
    private readonly initialConfig?: TConfig,
  ) {}

  onApplicationBootstrap() {
    this.state.enabled.next(this.initialState);
    this.state.config.next(this.initialConfig);
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
    return this.state.enabled.value === true;
  }
}
