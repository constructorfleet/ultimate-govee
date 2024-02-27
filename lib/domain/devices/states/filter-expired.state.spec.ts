import { Subscription } from 'rxjs';
import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { FilterExpiredState } from './filter-expired.state';

describe('FilterExpiredState', () => {
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
  const filterExpiredState = new FilterExpiredState(deviceModel);
  describe('parse', () => {
    let subscription: Subscription | undefined;

    afterEach(() => {
      if (subscription !== undefined) {
        subscription.unsubscribe();
      }
    });
    describe('when passed', () => {
      describe('state', () => {
        describe('without filterExpired', () => {
          it('value is not updated', () => {
            const subscriptionFn = jest.fn((active) =>
              expect(active).toBeUndefined(),
            );
            subscription = filterExpiredState.subscribe(subscriptionFn);
            filterExpiredState.parse({});
            expect(subscriptionFn).not.toHaveBeenCalled();
          });
        });
        describe('with filterExpired undefined', () => {
          it('value is not updated', () => {
            const subscriptionFn = jest.fn((active) =>
              expect(active).toBeUndefined(),
            );
            subscription = filterExpiredState.subscribe(subscriptionFn);
            filterExpiredState.parse({ state: { filterExpired: undefined } });
            expect(subscriptionFn).not.toHaveBeenCalled();
          });
        });
        describe('with filterExpired false', () => {
          it('value is set to false', () => {
            const subscriptionFn = jest.fn((expired) =>
              expect(expired).toBeFalsy(),
            );
            subscription = filterExpiredState.subscribe(subscriptionFn);
            filterExpiredState.parse({ state: { filterExpired: false } });
            expect(subscriptionFn).toHaveBeenCalledTimes(1);
          });
        });
        describe('with filterExpired true', () => {
          it('value is set to true', () => {
            const subscriptionFn = jest.fn((expired) =>
              expect(expired).toBeTruthy(),
            );
            subscription = filterExpiredState.subscribe(subscriptionFn);
            filterExpiredState.parse({ state: { filterExpired: true } });
            expect(subscriptionFn).toHaveBeenCalledTimes(1);
          });
        });
      });
    });
  });
});
