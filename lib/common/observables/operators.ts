/* eslint-disable func-names */
import { Observable, map, tap } from 'rxjs';
import { DeltaObservable, IdObject, MapDelta } from './types';
import { DeltaSet } from './delta-set.observable';

export function mapForEach<K, V>(
  map: ReadonlyMap<K, V>,
  fn?: (value: V) => void,
) {
  if (fn) {
    Array.from(map.values()).forEach((entry) => fn(entry));
  }
}

export function processElements<V extends IdObject<K>, K = string>(
  delta: MapDelta<K, V>,
  handlerFunctions: {
    add?: (value: Readonly<V>) => void;
    modify?: (value: Readonly<V>) => void;
    delete?: (value: Readonly<V>) => void;
  },
): void {
  mapForEach(delta.deleted, handlerFunctions.delete);
  mapForEach(delta.modified, handlerFunctions.modify);
  mapForEach(delta.added, handlerFunctions.add);
}

export function startDelta<V extends Readonly<IdObject<K>>, K = string>(): (
  delta: DeltaObservable<K, V>,
) => DeltaObservable<K, V> {
  let started = false;
  return map((delta: MapDelta<K, V>) => {
    if (!started) {
      // first pass, we add all elements to added for correct initial state
      delta = {
        all: delta.all,
        added: delta.all,
        deleted: new Map<K, V>(),
        modified: new Map<K, V>(),
      };
      started = true;
    }
    return delta;
  });
}

export function filterDelta<V extends Readonly<IdObject<K>>, K = string>(
  filterFunction: (entry: V) => boolean,
): (delta: DeltaObservable<K, V>) => DeltaObservable<K, V> {
  const filterSet = new DeltaSet<V, K>();
  filterSet.pauseDelta();

  return function (source: DeltaObservable<K, V>): DeltaObservable<K, V> {
    return new Observable((subscriber) => {
      const subscription = source.subscribe({
        next(delta) {
          if (delta.all.size === 0) {
            // optimization for empty source map
            filterSet.clear();
          } else {
            filterEntries(delta.modified);
            filterEntries(delta.added);
            deleteEntries(delta.deleted);
          }
          const newDelta = filterSet.getDelta();
          filterSet.clearDelta();
          if (
            newDelta.added.size > 0 ||
            newDelta.modified.size > 0 ||
            newDelta.deleted.size > 0
          ) {
            subscriber.next(newDelta);
          }
        },
        error(error) {
          subscriber.error(error);
        },
        complete() {
          subscriber.complete();
        },
      });
      return () => subscription.unsubscribe();
    });
  };

  function filterEntries(set: ReadonlyMap<K, V>) {
    Array.from(set.values()).forEach((entry) => {
      if (filterFunction(entry)) {
        filterSet.add(entry);
      } else {
        filterSet.delete(entry.id);
      }
    });
  }

  function deleteEntries(set: ReadonlyMap<K, V>) {
    Array.from(set.values()).forEach((entry) => filterSet.delete(entry.id));
  }
}

export function mapDelta<
  VO extends Readonly<IdObject<KO>>, // Value Origin
  VM extends IdObject<KM>, // Value Mapped
  KO = string, // Key Origin
  KM = string, // Key Mapped
>(
  mappingFunction: (entry: VO) => VM,
): (delta: DeltaObservable<KO, VO>) => DeltaObservable<KM, VM> {
  const mapSet = new DeltaSet<VM, KM>();
  mapSet.pauseDelta();

  return map((delta: MapDelta<KO, VO>) => {
    if (delta.all.size === 0) {
      // optimization for empty source map
      mapSet.clear();
    } else {
      mapEntries(delta.modified);
      mapEntries(delta.added);
      deleteEntries(delta.deleted);
    }
    const newDelta = mapSet.getDelta();
    mapSet.clearDelta();
    return newDelta;
  });

  function mapEntries(set: ReadonlyMap<KO, VO>) {
    Array.from(set.values()).forEach((entry) =>
      mapSet.add(mappingFunction(entry)),
    );
  }

  function deleteEntries(set: ReadonlyMap<KO, VO>) {
    Array.from(set.values()).forEach((entry) =>
      mapSet.delete(mappingFunction(entry).id),
    );
  }
}

export function tapDelta<
  V extends Readonly<IdObject<K>>,
  K = string,
>(handlerFunctions: {
  before?: () => void;
  add?: (value: Readonly<V>) => void;
  modify?: (value: Readonly<V>) => void;
  delete?: (value: Readonly<V>) => void;
  after?: () => void;
}): (delta: DeltaObservable<K, V>) => DeltaObservable<K, V> {
  return tap((delta: MapDelta<K, V>) => {
    if (handlerFunctions.before) {
      handlerFunctions.before();
    }
    mapForEach(delta.deleted, handlerFunctions.delete);
    mapForEach(delta.modified, handlerFunctions.modify);
    mapForEach(delta.added, handlerFunctions.add);
    if (handlerFunctions.after) {
      handlerFunctions.after();
    }
    return delta;
  });
}
export function processDelta<
  V extends Readonly<IdObject<K>>,
  K = string,
>(handlerFunctions?: {
  before?: (delta: MapDelta<K, V>) => void;
  add?: (value: Readonly<V>) => void;
  modify?: (value: Readonly<V>) => void;
  delete?: (value: Readonly<V>) => void;
  after?: (delta: MapDelta<K, V>) => void;
}): (delta: DeltaObservable<K, V>) => DeltaObservable<K, V> {
  let started = false;
  return map((delta: MapDelta<K, V>) => {
    if (!started) {
      // first pass, we add all elements to added for correct initial state
      delta = {
        all: delta.all,
        added: delta.all,
        deleted: new Map<K, V>(),
        modified: new Map<K, V>(),
      };
      started = true;
    }
    if (handlerFunctions) {
      if (handlerFunctions.before) {
        handlerFunctions.before(delta);
      }
      handleEntries(delta.deleted, handlerFunctions.delete);
      handleEntries(delta.modified, handlerFunctions.modify);
      handleEntries(delta.added, handlerFunctions.add);
      if (handlerFunctions.after) {
        handlerFunctions.after(delta);
      }
    }
    return delta;
  });

  function handleEntries<K, V>(
    set: ReadonlyMap<K, V>,
    fn?: (value: V) => void,
  ) {
    if (fn) {
      Array.from(set.values()).forEach((entry) => fn(entry));
    }
  }
}
