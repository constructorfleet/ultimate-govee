import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { ActiveState } from './active.state';
import { OpType, asOpCode } from '../../../common';
import {
  testParseStateCalled,
  testParseStateNotCalled,
  testSetStateCalled,
  testSetStateNotCalled,
} from '../../../common/test-utils';

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
    beforeEach(() => {
      state = new ActiveState(deviceModel, OpType.REPORT, [0x01]);
    });

    describe('when passed', () => {
      describe('an invalid', () => {
        describe('state argument', () => {
          it('does not update the value', async () => {
            expect(
              await testParseStateNotCalled(state, {}),
            ).not.toHaveBeenCalled();
          });
        });
        describe('op codes with different OpType', () => {
          it('does not update the value', async () => {
            expect(
              await testParseStateNotCalled(state, {
                op: { command: [[0x02, 0x02, 0x01]] },
              }),
            ).not.toHaveBeenCalled();
          });
        });
        describe('op codes with different identifier', () => {
          it('does not update the value', async () => {
            expect(
              await testParseStateNotCalled(state, {
                op: { command: [[OpType.REPORT, 0x02, 0x01]] },
              }),
            ).not.toHaveBeenCalled();
          });
        });
        describe('op codes with invalid op value', () => {
          it('does not update the value', async () => {
            expect(
              await testParseStateNotCalled(state, {
                op: { command: [[OpType.REPORT, 0x01, 0x10]] },
              }),
            ).not.toHaveBeenCalled();
          });
        });
      });
    });
    describe('a valid', () => {
      describe('state argument', () => {
        describe('with isOn=false', () => {
          it('sets the value to false', async () => {
            expect(
              await testParseStateCalled(state, { state: { isOn: false } }),
            ).toBeFalsy();
          });
        });
        describe('with isOn=true', () => {
          it('sets the value to true', async () => {
            expect(
              await testParseStateCalled(state, { state: { isOn: true } }),
            ).toBeTruthy();
          });
        });
      });
      describe('op code', () => {
        describe('with value 0', () => {
          it('sets the value to false', async () => {
            expect(
              await testParseStateCalled(state, {
                op: { command: [[OpType.REPORT, 0x01, 0x00]] },
              }),
            ).toBeFalsy();
          });
        });
        describe('with value 1', () => {
          it('sets the value to true', async () => {
            expect(
              await testParseStateCalled(state, {
                op: { command: [[OpType.REPORT, 0x01, 0x01]] },
              }),
            ).toBeTruthy();
          });
        });
      });
    });
  });
  describe('setState', () => {
    beforeEach(() => {
      state = new ActiveState(deviceModel, OpType.REPORT, [0x01]);
    });

    describe('when nextState is', () => {
      describe('undefined', () => {
        it('does not return a command', async () => {
          expect(
            await testSetStateNotCalled(state, undefined),
          ).not.toHaveBeenCalled();
        });
      });
      describe('not a boolean', () => {
        it('does not return a command', async () => {
          expect(
            await testSetStateNotCalled(state, JSON.parse('"true"')),
          ).not.toHaveBeenCalled();
        });
      });
      describe('true', () => {
        it('returns the activate command', async () => {
          const command = await testSetStateCalled(state, true);
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
      });
    });
    describe('false', () => {
      it('returns the deactivate command', async () => {
        const command = await testSetStateCalled(state, false);
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
    });
  });
});
