import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { ActiveState } from './active.state';
import { OpType } from '../../../common/op-code';
import { Subscription } from 'rxjs';
describe('ActiveState', () => {
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
  let activeState: ActiveState;

  describe('parse', () => {
    let subscription: Subscription | undefined;

    beforeEach(() => {
      activeState = new ActiveState(deviceModel, OpType.REPORT, [0x01]);
    });

    afterEach(() => {
      if (subscription !== undefined) {
        subscription.unsubscribe();
      }
    });

    describe('when passed', () => {
      describe('an invalid', () => {
        describe('state argument', () => {
          it('does not update the value', () => {
            const subscriptionFn = jest.fn((active) =>
              expect(active).toBeUndefined(),
            );
            subscription = activeState.subscribe(subscriptionFn);
            activeState.parse({});
            expect(subscriptionFn).not.toHaveBeenCalled();
          });
        });
        describe('op codes with different OpType', () => {
          it('does not update the value', () => {
            const subscriptionFn = jest.fn((active) =>
              expect(active).toBeUndefined(),
            );
            subscription = activeState.subscribe(subscriptionFn);
            activeState.parse({ op: { command: [[0x02, 0x02, 0x01]] } });
            expect(subscriptionFn).not.toHaveBeenCalled();
          });
        });
        describe('op codes with different identifier', () => {
          it('does not update the value', () => {
            const subscriptionFn = jest.fn((active) =>
              expect(active).toBeUndefined(),
            );
            subscription = activeState.subscribe(subscriptionFn);
            activeState.parse({
              op: { command: [[OpType.REPORT, 0x02, 0x01]] },
            });
            expect(subscriptionFn).not.toHaveBeenCalled();
          });
        });
        describe('op codes with invalid op value', () => {
          it('does not update the value', () => {
            const subscriptionFn = jest.fn((active) =>
              expect(active).toBeUndefined(),
            );
            subscription = activeState.subscribe(subscriptionFn);
            activeState.parse({
              op: { command: [[OpType.REPORT, 0x01, 0x10]] },
            });
            expect(subscriptionFn).not.toHaveBeenCalled();
          });
        });
      });
    });
    describe('a valid', () => {
      describe('state argument', () => {
        describe('with isOn=false', () => {
          it('sets the value to false', () => {
            const subscriptionFn = jest.fn((active) =>
              expect(active).toBeFalsy(),
            );
            subscription = activeState.subscribe(subscriptionFn);
            activeState.parse({ state: { isOn: false } });
            expect(subscriptionFn).toHaveBeenCalledTimes(1);
          });
        });
        describe('with isOn=true', () => {
          it('sets the value to true', () => {
            let expected = false;
            const subscriptionFn = jest.fn((active) =>
              expect(active).toEqual(expected),
            );
            subscription = activeState.subscribe(subscriptionFn);
            expected = true;
            activeState.parse({ state: { isOn: true } });
            expect(subscriptionFn).toHaveBeenCalledTimes(1);
          });
        });
      });
      describe('op code', () => {
        describe('with value 0', () => {
          it('sets the value to false', () => {
            const subscriptionFn = jest.fn((active) =>
              expect(active).toBeFalsy(),
            );
            subscription = activeState.subscribe(subscriptionFn);
            activeState.parse({
              op: { command: [[OpType.REPORT, 0x01, 0x00]] },
            });
            expect(subscriptionFn).toHaveBeenCalledTimes(1);
          });
        });
        describe('with value 1', () => {
          it('sets the value to true', () => {
            const subscriptionFn = jest.fn((active) =>
              expect(active).toBeTruthy(),
            );
            subscription = activeState.subscribe(subscriptionFn);
            activeState.parse({
              op: { command: [[OpType.REPORT, 0x01, 0x01]] },
            });
            expect(subscriptionFn).toHaveBeenCalledTimes(1);
          });
        });
      });
    });
  });
});
