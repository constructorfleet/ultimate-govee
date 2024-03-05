import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { Subscription } from 'rxjs';
import { ColorTempState } from './color-temp.state';

describe('ColorRGBState', () => {
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
  let state: ColorTempState;

  describe('parse', () => {
    let subscription: Subscription | undefined;

    beforeEach(() => {
      state = new ColorTempState(deviceModel);
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
            '{ "state": { "clr": {} } }',
            '{ "state": { "color": null } }',
            '{ "color": 10 }',
          ])('of %P, it does not update the value', (input) => {
            const data = JSON.parse(input);
            const subscriptionFn = jest.fn((active) =>
              expect(active).toBeUndefined(),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse(data);
            expect(subscriptionFn).not.toHaveBeenCalled();
          });
        });
      });
    });
    describe('a valid', () => {
      describe('color temperature', () => {
        describe('under state', () => {
          it.each([2000, 4500, 9000])('sets the value to %p', (colorValue) => {
            const subscriptionFn = jest.fn((color) =>
              expect(color).toEqual(colorValue),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse({ state: { colorTemperature: colorValue } });
            expect(subscriptionFn).toHaveBeenCalledTimes(1);
          });
        });
      });
    });
  });
});
