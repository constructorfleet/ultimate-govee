import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { Subscription } from 'rxjs';
import { PowerState } from './power.state';
import {
  testParseStateCalled,
  testParseStateNotCalled,
} from '../../../common/test-utils';

describe('PowerState', () => {
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
  let state: PowerState;

  describe('parse', () => {
    let subscription: Subscription | undefined;

    beforeEach(() => {
      state = new PowerState(deviceModel);
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
            '{ "state": { "bright": {} } }',
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
      describe('state', () => {
        describe('with isOn', () => {
          it.each([true, false])('sets the value to %p', async (power) => {
            expect(
              await testParseStateCalled(
                state,
                JSON.parse(JSON.stringify({ state: { isOn: power } })),
              ),
            ).toEqual(power);
          });
        });
        describe('with onOff', () => {
          it.each([true, false])('sets the value to %p', async (power) => {
            expect(
              await testParseStateCalled(
                state,
                JSON.parse(JSON.stringify({ state: { connected: power } })),
              ),
            ).toEqual(power);
          });
        });
      });
    });
  });
});
