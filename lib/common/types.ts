import { unitOfTime } from 'moment';

export type Ignorable<TValue> = TValue | null;

export type Optional<TValue> = TValue | undefined;

export type LabelFn = () => string;
export type LabelType = string | LabelFn;

export type Labelled = {
  label: LabelType;
};

export type Username = string;
export type Password = string;
export type AccountId = string;
export type ClientId = string;
export type DeviceId = string;

export type Credentials = {
  username: Username;
  password: Password;
  clientId?: ClientId;
};

export type DeviceCommandAddresses = {
  iotTopic?: string;
  bleAddress?: string;
};

export type Debuggable = {
  debug?: boolean;
};

export type LengthUnits = 'cm';
export type Distance = {
  value?: number;
  unit?: LengthUnits;
};

export type Duration = {
  value?: number;
  unit?: unitOfTime.DurationConstructor;
};
