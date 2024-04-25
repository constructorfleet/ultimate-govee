import { Optional } from '~ultimate-govee-common';
import MomentLib from 'moment';

export type PersistModuleOptions = {
  rootDirectory?: string;
};

export type PersistedFile = {
  filename: string;
  transform?: (data: any) => any;
};

export type PersistedFileData<T> = {
  lastUpdate?: Optional<MomentLib.Moment>;
  data?: Optional<T>;
};

export type GetPersistedFile<T> = (
  options: PersistedFile,
) => Promise<PersistedFileData<T>>;
