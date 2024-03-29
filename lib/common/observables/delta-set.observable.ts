import { DeltaMap } from './delta-map.observable';
import { DeltaMapSettings, IdObject } from './types';

export class DeltaSet<V extends IdObject<K>, K = string> extends DeltaMap<
  K,
  V
> {
  constructor();
  constructor(entries: Iterable<V>);
  constructor(settings?: DeltaMapSettings<V>);
  constructor(entries: Iterable<V>, settings?: DeltaMapSettings<V>);
  constructor(
    itemsOrSettings?: Iterable<V> | DeltaMapSettings<V>,
    settings?: DeltaMapSettings<V>,
  ) {
    super(itemsOrSettings as any, settings);
  }

  /**
   * Process constructor content, can be overriden and extended in subclasses
   */
  protected override initializeContent(entries: Iterable<any>): void {
    Array.from(entries).forEach((entry) => this.doSet(entry.id, entry));
  }

  /**
   * Adds or modifies an entry and notifies changes through _delta$_.
   *
   * If an existing entry is the same according to the _isEqual_ function, nothing is changed.
   */
  add(entry: V): DeltaSet<V, K> {
    super.set(entry.id, entry);
    return this;
  }

  /**
   * Adds or modifies multiple entries at once and notifies changes through _delta$_.
   *
   * If an existing entry is the same according to the _isEqual_ function, nothing is changed.
   */
  addMultiple(entries: Iterable<V>): void {
    Array.from(entries).forEach((newEntry) =>
      this.doSet(newEntry.id, newEntry),
    );
    this.publishDelta();
  }

  /**
   * Redirect to _entry.add_ to guarantee integrity of the IdObject Map.
   * @override
   * @deprecated use _add(entry)_ instead
   */
  override set(_id: K, entry: V): any {
    return this.add(entry);
  }

  /**
   * Replaces all existing entries with new entries.
   * - Adds _newEntries_ not existing in the current entries.
   * - Updates existing entries where _newEntries_ have changed (_isEqual_ function).
   * - Deletes entries not existing in _newEntries_.
   */
  replace(entries: Iterable<V>): void {
    const newEntriesSet = new Set<K>();

    // update additions and modifications
    Array.from(entries).forEach((newEntry) => {
      newEntriesSet.add(newEntry.id);
      this.doSet(newEntry.id, newEntry);
    });
    // update deletions
    Array.from(this.values()).forEach((oldEntry) => {
      if (!newEntriesSet.has(oldEntry.id)) {
        this.doDelete(oldEntry.id);
      }
    });
    this.publishDelta();
  }
}
