import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { Subscription } from 'rxjs';
import { OpType } from '../../../common/op-code';
import { ColorRGBState } from './color-rgb.state';
import {
  testParseStateCalled,
  testParseStateNotCalled,
} from '../../../common/test-utils';

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
    deviceExt: {
      externalResources: {
        imageUrl: 'https://example.com/H7567.png',
        onImageUrl: 'https://example.com/H7567-on.png',
        offImageUrl: 'https://example.com/H7567-off.png',
      },
    },
  });
  let state: ColorRGBState;

  describe('parse', () => {
    let subscription: Subscription | undefined;

    beforeEach(() => {
      state = new ColorRGBState(deviceModel, OpType.REPORT, [0x05, 0x02]);
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
          ])('of %P, it does not update the value', async (input) => {
            expect(
              await testParseStateNotCalled(state, JSON.parse(input)),
            ).not.toHaveBeenCalled();
          });
        });
        describe('op type', () => {
          it.each([0x00, 0x20, OpType.COMMAND])(
            'of %p, the value is not udpated',
            async (opType) => {
              const data = [opType, 0x05, 0x02];
              expect(
                await testParseStateNotCalled(state, {
                  op: { command: [data] },
                }),
              ).not.toHaveBeenCalled();
            },
          );
        });
        describe('op identifier', () => {
          it.each([0x01, 0x20, 0x00])(
            'of %p, the value is not udpated',
            async (identifier) => {
              expect(
                await testParseStateNotCalled(state, {
                  op: { command: [[OpType.REPORT, identifier, 0x02]] },
                }),
              ).not.toHaveBeenCalled();
            },
          );
        });
        describe('op sub-identifier', () => {
          it.each([0x01, 0x00, 0x00])(
            'of %p, the value is not udpated',
            async (identifier) => {
              expect(
                await testParseStateNotCalled(state, {
                  op: { command: [[OpType.REPORT, 0x05, identifier]] },
                }),
              ).not.toHaveBeenCalled();
            },
          );
        });
      });
      describe('a valid', () => {
        describe('color', () => {
          describe('under state', () => {
            it.each([
              { red: 255, green: 0, blue: 125 },
              { red: 0, green: 0, blue: 0 },
              { red: 100, green: 150, blue: 250 },
            ])('sets the value to %p', async (colorValue) => {
              expect(
                await testParseStateCalled(state, {
                  state: { color: colorValue },
                }),
              ).toStrictEqual(colorValue);
            });
          });
          describe('as an op code', () => {
            it.each(['[255, 0, 125]', '[0, 0, 0]', '[100, 150, 250]'])(
              'sets the value to %p',
              async (colorValue) => {
                const rgbArray = JSON.parse(colorValue);
                const expectedColor = {
                  red: rgbArray[0],
                  green: rgbArray[1],
                  blue: rgbArray[2],
                };
                expect(
                  await testParseStateCalled(state, {
                    op: {
                      command: [
                        [OpType.REPORT, 0x05, 0x02, ...JSON.parse(colorValue)],
                      ],
                    },
                  }),
                ).toStrictEqual(expectedColor);
              },
            );
          });
        });
      });
    });
  });
});
