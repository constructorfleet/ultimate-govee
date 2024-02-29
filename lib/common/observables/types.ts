import { Observable, Observer, Subscription } from 'rxjs';

export interface IdObject<K = string> {
  id: K;
}

export type DeltaObservable<K, V> = Observable<MapDelta<K, V>>;

export type IsModified<T> = (current: T, previous: T) => boolean;
export interface DeltaMapSettings<T> {
  isModified?: IsModified<T>; // function to determine whether an existing entry is modified
  publishEmpty?: boolean; // always publish delta on first action, even if the map is still empty (default: true)
  copyAll?: boolean; // create a copy of all map elements for each MapDelta update
}
export interface MapDelta<K, V> {
  all: Map<K, V>;
  added: Map<K, V>;
  deleted: Map<K, V>;
  modified: Map<K, V>;
}

export type ParitalObservable<T> = {
  partialNext(value: Partial<T>);
  partialSubscribe(observer: Partial<Observer<Partial<T>>>): Subscription;
};
