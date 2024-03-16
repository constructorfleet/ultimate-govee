import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { Subscription } from 'rxjs';
import { ConnectedState } from './connected.state';
import {
  testParseStateCalled,
  testParseStateNotCalled,
} from '../../../common/test-utils';

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
          ])('of %P, it does not update the value', async (input) => {
            expect(
              await testParseStateNotCalled(state, JSON.parse(input)),
            ).not.toHaveBeenCalled();
          });
        });
      });
    });
    describe('a valid', () => {
      describe('connection under state', () => {
        describe('with online key', () => {
          it.each([true, false])(
            'sets the value to %p',
            async (connectionValue) => {
              expect(
                await testParseStateCalled(
                  state,
                  JSON.parse(
                    JSON.stringify({ state: { online: connectionValue } }),
                  ),
                ),
              ).toEqual(connectionValue);
            },
          );
        });
        describe('with connected key', () => {
          it.each([true, false])(
            'sets the value to %p',
            async (connectionValue) => {
              expect(
                await testParseStateCalled(
                  state,
                  JSON.parse(
                    JSON.stringify({ state: { connected: connectionValue } }),
                  ),
                ),
              ).toEqual(connectionValue);
            },
          );
        });
        describe('with isOnline key', () => {
          it.each([true, false])(
            'sets the value to %p',
            async (connectionValue) => {
              expect(
                await testParseStateCalled(
                  state,
                  JSON.parse(
                    JSON.stringify({ state: { isOnline: connectionValue } }),
                  ),
                ),
              ).toEqual(connectionValue);
            },
          );
        });
        describe('with isConnected key', () => {
          it.each([true, false])(
            'sets the value to %p',
            async (connectionValue) => {
              expect(
                await testParseStateCalled(
                  state,
                  JSON.parse(
                    JSON.stringify({ state: { isConnected: connectionValue } }),
                  ),
                ),
              ).toEqual(connectionValue);
            },
          );
        });
      });
    });
  });
});
