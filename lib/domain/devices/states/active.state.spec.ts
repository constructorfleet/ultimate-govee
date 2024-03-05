import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { ActiveState } from './active.state';
import { OpType, asOpCode } from '../../../common/op-code';
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
  let state: ActiveState;

  describe('parse', () => {
    let subscription: Subscription | undefined;

    beforeEach(() => {
      state = new ActiveState(deviceModel, OpType.REPORT, [0x01]);
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
            subscription = state.subscribe(subscriptionFn);
            state.parse({});
            expect(subscriptionFn).not.toHaveBeenCalled();
          });
        });
        describe('op codes with different OpType', () => {
          it('does not update the value', () => {
            const subscriptionFn = jest.fn((active) =>
              expect(active).toBeUndefined(),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse({ op: { command: [[0x02, 0x02, 0x01]] } });
            expect(subscriptionFn).not.toHaveBeenCalled();
          });
        });
        describe('op codes with different identifier', () => {
          it('does not update the value', () => {
            const subscriptionFn = jest.fn((active) =>
              expect(active).toBeUndefined(),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse({
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
            subscription = state.subscribe(subscriptionFn);
            state.parse({
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
            subscription = state.subscribe(subscriptionFn);
            state.parse({ state: { isOn: false } });
            expect(subscriptionFn).toHaveBeenCalledTimes(1);
          });
        });
        describe('with isOn=true', () => {
          it('sets the value to true', () => {
            let expected = false;
            const subscriptionFn = jest.fn((active) =>
              expect(active).toEqual(expected),
            );
            subscription = state.subscribe(subscriptionFn);
            expected = true;
            state.parse({ state: { isOn: true } });
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
            subscription = state.subscribe(subscriptionFn);
            state.parse({
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
            subscription = state.subscribe(subscriptionFn);
            state.parse({
              op: { command: [[OpType.REPORT, 0x01, 0x01]] },
            });
            expect(subscriptionFn).toHaveBeenCalledTimes(1);
          });
        });
      });
    });
  });
  describe('setState', () => {
    let subscription: Subscription;
    beforeEach(() => {
      state = new ActiveState(deviceModel, OpType.REPORT, [0x01]);
    });
    afterEach(() => {
      if (subscription) {
        subscription.unsubscribe();
      }
    });

    describe('when nextState is', () => {
      describe('undefined', () => {
        it('does not return a command', () => {
          subscription = state.commandBus.subscribe((command) => {
            expect(command).toBeUndefined();
          });
          expect(state.setState(undefined)).toEqual([]);
        });
      });
      describe('not a boolean', () => {
        it('does not return a command', () => {
          subscription = state.commandBus.subscribe((command) => {
            expect(command).toBeUndefined();
          });
          expect(state.setState(JSON.parse('"true"'))).toEqual([]);
        });
      });
      describe('true', () => {
        it('returns the activate command', () => {
          subscription = state.commandBus.subscribe((command) => {
            expect(command).toHaveProperty('commandId');
            expect(command.commandId).toBeDefined();
            expect(command).toHaveProperty('data');
            expect(command.data).toHaveProperty('command');
            expect(command.data.command).toBeDefined();
            expect(command.data.command).toHaveLength(1);
            expect(command.data?.command?.at(0)).toEqual(
              expect.arrayContaining(asOpCode(OpType.COMMAND, 0x01, 0x01)),
            );
          });
          expect(state.setState(true)).toBeDefined();
        });
      });
      describe('false', () => {
        it('returns the deactivate command', () => {
          subscription = state.commandBus.subscribe((command) => {
            expect(command).toHaveProperty('commandId');
            expect(command.commandId).toBeDefined();
            expect(command).toHaveProperty('data');
            expect(command.data).toHaveProperty('command');
            expect(command.data.command).toBeDefined();
            expect(command.data.command).toHaveLength(1);
            expect(command.data?.command?.at(0)).toEqual(
              expect.arrayContaining(asOpCode(OpType.COMMAND, 0x01, 0x00)),
            );
          });
          expect(state.setState(true)).toBeDefined();
        });
      });
    });
  });
});
