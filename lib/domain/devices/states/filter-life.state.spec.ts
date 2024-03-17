import { Subscription } from 'rxjs';
import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { FilterLifeState } from './filter-life.state';
import { OpType } from '../../../common/op-code';

describe('FilterLifeState', () => {
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
  const state = new FilterLifeState(deviceModel, OpType.REPORT, 0x19);
  describe('parse', () => {
    let subscription: Subscription | undefined;

    afterEach(() => {
      if (subscription !== undefined) {
        subscription.unsubscribe();
      }
    });
    describe('when passed', () => {
      describe('state', () => {
        it('value is not updated', () => {
          const subscriptionFn = jest.fn((active) =>
            expect(active).toBeUndefined(),
          );
          subscription = state.subscribe(subscriptionFn);
          state.parse({ state: {} });
          expect(subscriptionFn).not.toHaveBeenCalled();
        });
      });
      describe('opCode', () => {
        describe('with no op-code', () => {
          it('value is not updated', () => {
            const subscriptionFn = jest.fn((active) =>
              expect(active).toBeUndefined(),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse({ op: {} });
            expect(subscriptionFn).not.toHaveBeenCalled();
          });
        });
        describe('with wrong op-type', () => {
          it('value is not updated', () => {
            const subscriptionFn = jest.fn((active) =>
              expect(active).toBeUndefined(),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse({ op: { command: [[100, 10, 10, 10, 10]] } });
            expect(subscriptionFn).not.toHaveBeenCalled();
          });
        });
        describe('with wrong identifier', () => {
          it('value is not updated', () => {
            const subscriptionFn = jest.fn((active) =>
              expect(active).toBeUndefined(),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse({
              op: { command: [[OpType.REPORT, 10, 10, 10, 10]] },
            });
            expect(subscriptionFn).not.toHaveBeenCalled();
          });
        });
        describe('with negative filterLife', () => {
          it('value is not set', () => {
            const subscriptionFn = jest.fn((filterLife) =>
              expect(filterLife).toBeUndefined(),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse({
              op: {
                command: [[OpType.REPORT, 25, 0, 10, 10, 10, 10, -10, 10]],
              },
            });
            expect(subscriptionFn).not.toHaveBeenCalled();
          });
        });
        describe('with filterLife over 100', () => {
          it('value is not set', () => {
            const subscriptionFn = jest.fn((filterLife) =>
              expect(filterLife).toBeUndefined(),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse({
              op: {
                command: [[OpType.REPORT, 25, 0, 10, 10, 10, 10, 255, 10]],
              },
            });
            expect(subscriptionFn).not.toHaveBeenCalled();
          });
        });
        describe('with filterLife set to', () => {
          it.each([0, 1, 10, 50, 100])('value is set to %p', (life: number) => {
            const subscriptionFn = jest.fn((expired) =>
              expect(expired).toEqual(life),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse({
              op: {
                command: [[OpType.REPORT, 25, 0, 10, 10, 10, 10, life, 10]],
              },
            });
            expect(subscriptionFn).toHaveBeenCalledTimes(1);
          });
        });
      });
    });
  });
});
