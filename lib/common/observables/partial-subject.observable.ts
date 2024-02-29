import { BehaviorSubject, Observer, Subject, Subscription } from 'rxjs';
import { ParitalObservable } from './types';

export class PartialBehaviorSubject<T>
  extends BehaviorSubject<T>
  implements ParitalObservable<T>
{
  private readonly partial$ = new Subject<Partial<T>>();

  partialSubscribe(observer: Partial<Observer<Partial<T>>>): Subscription {
    return this.partial$.subscribe(observer);
  }

  partialNext(value: Partial<T>) {
    this.partial$.next(value);
    const current = this.getValue();
    if (
      current !== undefined &&
      current !== null &&
      typeof current === 'object'
    ) {
      Object.entries(current).forEach(([k, v]) => (current[k] = v));
    }
    this.next(current);
  }
}
