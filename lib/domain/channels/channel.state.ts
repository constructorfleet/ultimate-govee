import { BehaviorSubject } from 'rxjs';

export type ChannelState<TConfig extends object> = {
  config: BehaviorSubject<TConfig | undefined>;
  enabled: BehaviorSubject<boolean | undefined>;
};

export type Togglable = {
  togglable: boolean;
};
