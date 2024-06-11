import { Subscription } from 'rxjs';
import { OpType } from '../../../common';
import {
  testParseStateCalled,
  testParseStateNotCalled,
} from '../../../common/test-utils';
import { GoveeDeviceStatus } from '../../../data';
import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { UnknownState } from './unknown.state';

describe('UnknownState', () => {
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
  const unknownState25 = new UnknownState(deviceModel, OpType.REPORT, 0x19);
  const unknownState5_3 = new UnknownState(
    deviceModel,
    OpType.REPORT,
    0x05,
    0x03,
  );
  describe('parse', () => {
    let subscription: Subscription | undefined;
    afterEach(() => {
      subscription?.unsubscribe();
    });
    describe('when passed', () => {
      describe('state', () => {
        it('value is not updated', async () => {
          const forState = async (state: UnknownState) => {
            return await testParseStateNotCalled(state, { state: {} });
          };
          expect(await forState(unknownState25)).not.toHaveBeenCalled();
          subscription?.unsubscribe();
          expect(await forState(unknownState5_3)).not.toHaveBeenCalled();
        });
      });
      describe('opCode', () => {
        describe('with no op-code', () => {
          it('value is not updated', async () => {
            const forState = async (state: UnknownState) => {
              return await testParseStateNotCalled(state, { op: {} });
            };
            expect(await forState(unknownState25)).not.toHaveBeenCalled();
            subscription?.unsubscribe();
            expect(await forState(unknownState5_3)).not.toHaveBeenCalled();
          });
        });
        describe('with wrong op-type', () => {
          it('value is not updated', async () => {
            const forState = async (
              state: UnknownState,
              status: Partial<GoveeDeviceStatus>,
            ) => {
              return await testParseStateNotCalled(state, status);
            };
            expect(
              await forState(unknownState25, {
                op: { command: [[100, 10, 10, 10, 10]] },
              }),
            ).not.toHaveBeenCalled();
            subscription?.unsubscribe();
            expect(
              await forState(unknownState5_3, {
                op: { command: [[100, 10, 10, 10, 10]] },
              }),
            ).not.toHaveBeenCalled();
          });
        });
        describe('with wrong identifier', () => {
          it('value is not updated', async () => {
            const forState = async (
              state: UnknownState,
              status: Partial<GoveeDeviceStatus>,
            ) => {
              return await testParseStateNotCalled(state, status);
            };
            expect(
              await forState(unknownState25, {
                op: { command: [[OpType.REPORT, 10, 10, 10, 10]] },
              }),
            ).not.toHaveBeenCalled();
            subscription?.unsubscribe();
            expect(
              await forState(unknownState5_3, {
                op: { command: [[OpType.REPORT, 10, 10, 10, 10]] },
              }),
            ).not.toHaveBeenCalled();
          });
        });
        describe('with correct identifier', () => {
          it('value is updated', async () => {
            const forState = async (
              state: UnknownState,
              opType: number,
              identifier: number[],
              stateCodes: number[],
            ) => {
              return await testParseStateCalled(state, {
                op: { command: [[opType, ...identifier, ...stateCodes]] },
              });
            };
            let expectedCodes = [0x01, 0x10, 0x05];
            expect(
              await forState(
                unknownState25,
                OpType.REPORT,
                [25],
                expectedCodes,
              ),
            ).toEqual({ codes: expectedCodes });
            expectedCodes = [0x19, 0x05];
            expect(
              await forState(
                unknownState5_3,
                OpType.REPORT,
                [5, 3],
                expectedCodes,
              ),
            ).toEqual({ codes: expectedCodes });
          });
        });
      });
    });
  });
});
