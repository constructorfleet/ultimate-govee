import { Subscription } from 'rxjs';
import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { FilterExpiredState } from './filter-expired.state';
import {
  testParseStateCalled,
  testParseStateNotCalled,
} from '../../../common/test-utils';

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
    deviceExt: {
      externalResources: {
        imageUrl: 'https://example.com/H7567.png',
        onImageUrl: 'https://example.com/H7567-on.png',
        offImageUrl: 'https://example.com/H7567-off.png',
      },
    },
  });
  const state = new FilterExpiredState(deviceModel);
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
          it('value is not updated', async () => {
            expect(
              await testParseStateNotCalled(state, {}),
            ).not.toHaveBeenCalled();
          });
        });
        describe('with filterExpired undefined', () => {
          it('value is not updated', async () => {
            expect(
              await testParseStateNotCalled(state, {
                state: { filterExpired: undefined },
              }),
            ).not.toHaveBeenCalled();
          });
        });
        describe('with filterExpired false', () => {
          it('value is set to false', async () => {
            expect(
              await testParseStateCalled(state, {
                state: { filterExpired: false },
              }),
            ).toBe(false);
          });
        });
        describe('with filterExpired true', () => {
          it('value is set to true', async () => {
            expect(
              await testParseStateCalled(state, {
                state: { filterExpired: true },
              }),
            ).toBe(true);
          });
        });
      });
    });
  });
});
