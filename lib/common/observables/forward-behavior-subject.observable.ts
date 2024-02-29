import { ObjectUnsubscribedError, Subject } from 'rxjs';

export class ForwardBehaviorSubject<T> extends Subject<T> {
  constructor(private _value: T) {
    super();
  }

  get value(): T {
    return this.getValue();
  }

  getValue(): T {
    const { hasError, thrownError, _value } = this;
    if (hasError) {
      throw thrownError;
    }
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    return _value;
  }

  next(value: T): void {
    super.next((this._value = value));
  }
}
