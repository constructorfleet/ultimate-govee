import { Subscription } from 'rxjs';
import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { DeviceState } from './device.state';
import { Optional } from '../../../common';
import { StateCommandAndStatus } from './states.types';

class TestState extends DeviceState<'TEST', string> {
  protected readonly stateToCommand = (
    state: string,
  ): Optional<StateCommandAndStatus> => {
    return {
      command: {
        data: {
          opcode: state,
        },
      },
      status: {},
    };
  };
}

const getEmittedValue = async (
  state: TestState,
  last: number,
): Promise<string | undefined> => {
  let subscription: Subscription | undefined;
  const result = await new Promise<string | undefined>((resolve) => {
    subscription = state.commandBus.subscribe((cmd) => {
      resolve(cmd?.data?.opcode);
    });
    state.previousState(last);
  });
  subscription?.unsubscribe();
  return result;
};

describe('DeviceState', () => {
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
  describe('previous', () => {
    it('is initialized with the initial state value', () => {
      const state = new TestState(deviceModel, 'TEST', 'Test');
      expect(state.history.size()).toBe(1);
      expect(state.history.peek()).toBe('Test');
    });
    describe('when invoked with', () => {
      describe('a negative nubmer', () => {
        it('does not emit a state command change', () => {
          const state = new TestState(deviceModel, 'TEST', 'A');
          const cb = jest.fn();
          const subscription = state.commandBus.subscribe(cb);
          state.previousState(-1);
          expect(cb).not.toHaveBeenCalled();
          subscription.unsubscribe();
        });
      });
      describe('a value larger than the history queue', () => {
        const state = new TestState(deviceModel, 'TEST', 'B');
        it('does not emit a state command change', () => {
          const cb = jest.fn();
          const subscription = state.commandBus.subscribe(cb);
          state.previousState(109);
          expect(cb).not.toHaveBeenCalled();
          subscription.unsubscribe();
        });
        it('clears the queue', () => {
          expect(state.history.size()).toBe(0);
        });
      });
      describe('1', () => {
        const state = new TestState(deviceModel, 'TEST', 'Hello');
        state.history.enstack('World');
        const length = state.history.size();
        it('emits the previous state', async () => {
          expect(await getEmittedValue(state, 1)).toBe('World');
        });
        it('has 1 less item in the history queye', () => {
          expect(state.history.size()).toBe(length - 1);
        });
      });
      describe('2', () => {
        const state = new TestState(deviceModel, 'TEST', 'Adam');
        state.history.enstack('Carrie');
        state.history.enstack('Grant');
        const length = state.history.size();
        it('emits the 2nd previous state', async () => {
          expect(await getEmittedValue(state, 2)).toBe('Carrie');
        });
        it('has 2 less item in the history queye', () => {
          expect(state.history.size()).toBe(length - 2);
        });
      });
    });
  });
});
