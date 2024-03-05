import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { Subscription } from 'rxjs';
import { ConnectedState } from './connected.state';

describe('ConnectedState', () => {
  const deviceModel: DeviceModel = new DeviceModel({
    id: '01:02:03:04:05:06:07:08',
    ic: 0,
    name: 'Test device',
    category: 'Generic',
    categoryGroup: 'Device',
    model: 'H7567',
    modelName: 'Some kind of device',
    goodsType: 30,
    pactType: 10,
    pactCode: 4,
    version: new Version('1.0.0', '2.0.0'),
    state: {},
  });
  let state: ConnectedState;

  describe('parse', () => {
    let subscription: Subscription | undefined;

    beforeEach(() => {
      state = new ConnectedState(deviceModel);
    });

    afterEach(() => {
      if (subscription !== undefined) {
        subscription.unsubscribe();
      }
    });

    describe('when passed', () => {
      describe('an invalid', () => {
        describe('state argument', () => {
          it.each([
            '{}',
            '{ "state": { "power": {} } }',
            '{ "state": { "off": null } }',
            '{ "online": true }',
          ])('of %P, it does not update the value', (input) => {
            const data = JSON.parse(input);
            const subscriptionFn = jest.fn((connected) =>
              expect(connected).toBeUndefined(),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse(data);
            expect(subscriptionFn).not.toHaveBeenCalled();
          });
        });
      });
    });
    describe('a valid', () => {
      describe('connection under state', () => {
        describe('with key online', () => {
          it.each([true, false])('sets the value to %p', (connectionValue) => {
            const subscriptionFn = jest.fn((connection) =>
              expect(connection).toEqual(connectionValue),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse(
              JSON.parse(
                JSON.stringify({ state: { online: connectionValue } }),
              ),
            );
            expect(subscriptionFn).toHaveBeenCalledTimes(1);
          });
        });
        describe('with key connected', () => {
          it.each([true, false])('sets the value to %p', (connectionValue) => {
            const subscriptionFn = jest.fn((connection) =>
              expect(connection).toEqual(connectionValue),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse(
              JSON.parse(
                JSON.stringify({ state: { connected: connectionValue } }),
              ),
            );
            expect(subscriptionFn).toHaveBeenCalledTimes(1);
          });
        });
        describe('with key isOnline', () => {
          it.each([true, false])('sets the value to %p', (connectionValue) => {
            const subscriptionFn = jest.fn((connection) =>
              expect(connection).toEqual(connectionValue),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse(
              JSON.parse(
                JSON.stringify({ state: { isOnline: connectionValue } }),
              ),
            );
            expect(subscriptionFn).toHaveBeenCalledTimes(1);
          });
        });
        describe('with key isConnected', () => {
          it.each([true, false])('sets the value to %p', (connectionValue) => {
            const subscriptionFn = jest.fn((connection) =>
              expect(connection).toEqual(connectionValue),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse(
              JSON.parse(
                JSON.stringify({ state: { isConnected: connectionValue } }),
              ),
            );
            expect(subscriptionFn).toHaveBeenCalledTimes(1);
          });
        });
      });
    });
  });
});
