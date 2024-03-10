import { Observer, Subject, Subscription } from 'rxjs';
import { wipeTimeout } from './utils';
import { GoveeDeviceCommand, GoveeDeviceStatus } from '../data';

type Command = Omit<GoveeDeviceCommand, 'deviceId'>;

type TestDeviceState<StateValue> = {
  parse: (state: Partial<GoveeDeviceStatus>) => void;
  subscribe: (
    observerOrNext?:
      | Partial<Observer<StateValue>>
      | ((value: StateValue) => void),
  ) => Subscription;
  setState: (nextState: StateValue) => string[];
  get commandBus(): Subject<Omit<GoveeDeviceCommand, 'deviceId'>>;
};

export const testParseStateNotCalled = async <StateValue>(
  state: TestDeviceState<StateValue>,
  value: Partial<GoveeDeviceStatus>,
): Promise<jest.Mock> => {
  let subscription: Subscription | undefined = undefined;
  return await new Promise<jest.Mock>((resolve, reject) => {
    let timeout: NodeJS.Timeout | undefined = undefined;
    const subscriptionFn = jest.fn((state) => {
      wipeTimeout(timeout);
      expect(state).toBeUndefined();
      if (subscription) {
        subscription.unsubscribe();
      }
      reject();
    });
    subscription = state.subscribe(subscriptionFn);
    state.parse(value);
    timeout = setTimeout(() => {
      wipeTimeout(timeout);
      if (subscription) {
        subscription.unsubscribe();
      }
      resolve(subscriptionFn);
    }, 100);
  });
};

export const testSetStateNotCalled = async <StateValue>(
  state: TestDeviceState<StateValue>,
  value: StateValue,
): Promise<jest.Mock> => {
  let subscription: Subscription | undefined = undefined;
  return await new Promise<jest.Mock>((resolve, reject) => {
    let timeout: NodeJS.Timeout | undefined = undefined;
    const subscriptionFn = jest.fn((state) => {
      wipeTimeout(timeout);
      expect(state).toBeUndefined();
      if (subscription) {
        subscription.unsubscribe();
      }
      reject();
    });
    subscription = state.commandBus.subscribe(subscriptionFn);
    expect(state.setState(value)).toEqual([]);
    timeout = setTimeout(() => {
      wipeTimeout(timeout);
      if (subscription) {
        subscription.unsubscribe();
      }
      resolve(subscriptionFn);
    }, 100);
  });
};

export const testParseStateCalled = async <StateValue>(
  state: TestDeviceState<StateValue>,
  value: Partial<GoveeDeviceStatus>,
): Promise<StateValue> => {
  let subscription: Subscription | undefined = undefined;
  return await new Promise<StateValue>((resolve, reject) => {
    let timeout: NodeJS.Timeout | undefined = undefined;
    const subscriptionFn = jest.fn((state: StateValue) => {
      wipeTimeout(timeout);
      if (subscription) {
        subscription.unsubscribe();
      }
      resolve(state);
    });
    subscription = state.subscribe(subscriptionFn);
    state.parse(value);
    timeout = setTimeout(() => {
      wipeTimeout(timeout);
      if (subscription) {
        subscription.unsubscribe();
      }
      reject();
    }, 100);
  });
};

export const testSetStateCalled = async <StateValue>(
  state: TestDeviceState<StateValue>,
  value: StateValue,
): Promise<Command> => {
  let subscription: Subscription | undefined = undefined;
  return await new Promise<Command>((resolve, reject) => {
    let timeout: NodeJS.Timeout | undefined = undefined;
    const subscriptionFn = jest.fn((command: Command) => {
      if (subscription) {
        subscription.unsubscribe();
      }
      wipeTimeout(timeout);
      resolve(command);
    });

    subscription = state.commandBus.subscribe(subscriptionFn);
    expect(state.setState(value)).toBeDefined();
    timeout = setTimeout(() => {
      wipeTimeout(timeout);
      if (subscription) {
        subscription.unsubscribe();
      }
      reject('subscription not called');
    }, 100);
  });
};
