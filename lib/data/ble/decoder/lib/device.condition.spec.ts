import { DecodeDevice } from './types';
import { deviceMatches } from './device.condition';
import { v4 as uuidv4 } from 'uuid';

describe('deviceMatches', () => {
  describe('H5179', () => {
    const conditions = [
      'name',
      'index',
      0,
      'Govee_H5179',
      '&',
      'manufacturerdata',
      '=',
      22,
      'index',
      0,
      '0188ec',
    ];
    describe('with name', () => {
      describe('Govee_H5179_34F7', () => {
        const name = 'Govee_H5179_34F7';
        describe('with manufacturerData', () => {
          describe('"0188ec000101ac08ec0949"', () => {
            const manufacturerData = '0188ec000101ac08ec0949';
            const device: DecodeDevice = {
              manufacturerData,
              name,
              serviceData: [
                {
                  uuid: uuidv4().replace('-', ''),
                  data: '041009760c',
                },
              ],
              uuid: uuidv4().replace('-', ''),
              macAddress: '0fd43832317d60ff',
            };
            it('matches', () => {
              expect(deviceMatches(device, conditions)).toBeTruthy();
            });
          });
          describe.each([
            '4c001219d0d18b5b1d35095e651a5b1f3051e288083f7715396306011b',
            '0288ec0001010180',
            '0184ec000101ac08ec0949',
            '0188ec000101ac08ec09',
          ])('%p', (manufacturerData) => {
            const device: DecodeDevice = {
              manufacturerData,
              name,
              serviceData: [
                {
                  uuid: uuidv4().replace('-', ''),
                  data: '041009760c',
                },
              ],
              uuid: uuidv4().replace('-', ''),
              macAddress: '0fd43832317d60ff',
            };
            it('does not match', () => {
              expect(deviceMatches(device, conditions)).toBeFalsy();
            });
          });
        });
      });
      describe.each(['Govee_H5106', 'ihoment_611A', 'Apple HomePod'])(
        '%p',
        (name: string) => {
          const device: DecodeDevice = {
            manufacturerData:
              '010001010d20c75f4c000215494e54454c4c495f524f434b535f48575075f2ff0c',
            name,
            serviceData: [
              {
                uuid: uuidv4().replace('-', ''),
                data: '041009760c',
              },
            ],
            uuid: uuidv4().replace('-', ''),
            macAddress: '0fd43832317d60ff',
          };
          it('does not match', () => {
            expect(deviceMatches(device, conditions)).toBeFalsy();
          });
        },
      );
    });
  });
  describe('H5106', () => {
    const conditions = [
      'name',
      'index',
      0,
      'GVH5106',
      '&',
      'manufacturerdata',
      '>=',
      16,
      'index',
      0,
      '0100',
    ];
    describe('with name', () => {
      describe('GVH5106_4670', () => {
        const name = 'GVH5106_4670';
        describe('with manufacturerData', () => {
          describe('"010001010d01cdb4"', () => {
            const manufacturerData = '010001010d01cdb4';
            const device: DecodeDevice = {
              manufacturerData,
              name,
              serviceData: [
                {
                  uuid: uuidv4().replace('-', ''),
                  data: '041009760c',
                },
              ],
              uuid: uuidv4().replace('-', ''),
              macAddress: '0fd43832317d60ff',
            };
            it('matches', () => {
              expect(deviceMatches(device, conditions)).toBeTruthy();
            });
          });
          describe.each([
            '4c001219d0d18b5b1d35095e651a5b1f3051e288083f7715396306011b',
            '0288ec0001010180',
            '0184ec000101ac08ec0949',
            '0188ec000101ac08ec09',
            '010001010d01cdb',
            '011001010d01cdb4',
          ])('%s', (manufacturerData) => {
            const device: DecodeDevice = {
              manufacturerData,
              name,
              serviceData: [
                {
                  uuid: uuidv4().replace('-', ''),
                  data: '041009760c',
                },
              ],
              uuid: uuidv4().replace('-', ''),
              macAddress: '0fd43832317d60ff',
            };
            it('does not match', () => {
              expect(deviceMatches(device, conditions)).toBeFalsy();
            });
          });
        });
      });
      describe.each(['Govee_H5106', 'ihoment_611A', 'Apple HomePod'])(
        '%p',
        (name: string) => {
          const device: DecodeDevice = {
            manufacturerData:
              '010001010d20c75f4c000215494e54454c4c495f524f434b535f48575075f2ff0c',
            name,
            serviceData: [
              {
                uuid: uuidv4().replace('-', ''),
                data: '041009760c',
              },
            ],
            uuid: uuidv4().replace('-', ''),
            macAddress: '0fd43832317d60ff',
          };
          it('does not match', () => {
            expect(deviceMatches(device, conditions)).toBeFalsy();
          });
        },
      );
    });
  });
  describe('H5055', () => {
    const conditions = [
      'manufacturerdata',
      '>=',
      41,
      'index',
      12,
      '06',
      '|',
      'manufacturerdata',
      '>=',
      41,
      'index',
      12,
      '20',
      '&',
      'manufacturerdata',
      'index',
      26,
      '06',
      '|',
      'manufacturerdata',
      '>=',
      41,
      'index',
      26,
      '20',
      '&',
      'manufacturerdata',
      'index',
      40,
      '0',
    ];
    describe('with name', () => {
      describe('GVH5055_5F2D', () => {
        const name = 'GVH5055_5F2D';
        describe('with manufacturerData', () => {
          describe.each([
            'cf040400461b061700ffff2c01067300ffff2c010000',
            'cf040400417f065600ffff2c01069100ffff2c010',
            'cf040400417f065600ffff2c01069100ffff2c010',
            'cf040400538f06ffffffff2c01065400ffff2c010',
            'cf040400417f205600ffff2c01069100ffff2c010',
          ])('%p', (manufacturerData) => {
            const device: DecodeDevice = {
              manufacturerData,
              name,
              serviceData: [
                {
                  uuid: uuidv4().replace('-', ''),
                  data: '041009760c',
                },
              ],
              uuid: uuidv4().replace('-', ''),
              macAddress: '0fd43832317d60ff',
            };
            it('matches', () => {
              expect(deviceMatches(device, conditions)).toBeTruthy();
            });
          });
          describe.each([
            '4c001219d0d18b5b1d35095e651a5b1f3051e288083f7715396306011b',
            '0288ec0001010180',
            '0184ec000101ac08ec0949',
            '0188ec000101ac08ec09',
            '010001010d01cdb',
            '011001010d01cdb4',
            'cf040400461b051700ffff2c01067300ffff2c01',
            'cf040400417f205600ffff2c01059100ffff2c010',
            'cf040400417f205600ffff2c01049100ffff2c010',
          ])('%s', (manufacturerData) => {
            const device: DecodeDevice = {
              manufacturerData,
              name,
              serviceData: [
                {
                  uuid: uuidv4().replace('-', ''),
                  data: '041009760c',
                },
              ],
              uuid: uuidv4().replace('-', ''),
              macAddress: '0fd43832317d60ff',
            };
            it('does not match', () => {
              expect(deviceMatches(device, conditions)).toBeFalsy();
            });
          });
        });
      });
      describe.each(['Govee_H5106', 'ihoment_611A', 'Apple HomePod'])(
        '%p',
        (name: string) => {
          const device: DecodeDevice = {
            manufacturerData:
              '010001010d20c75f4c000215494e54454c4c495f524f434b535f48575075f2ff0c',
            name,
            serviceData: [
              {
                uuid: uuidv4().replace('-', ''),
                data: '041009760c',
              },
            ],
            uuid: uuidv4().replace('-', ''),
            macAddress: '0fd43832317d60ff',
          };
          it('does not match', () => {
            expect(deviceMatches(device, conditions)).toBeFalsy();
          });
        },
      );
    });
  });
  describe('H5074', () => {
    const conditions = [
      'name',
      'index',
      0,
      'Govee_H5074',
      '&',
      'manufacturerdata',
      '>=',
      18,
      'index',
      0,
      '88ec',
    ];
    describe('with name', () => {
      describe('Govee_H5074_5F2D', () => {
        const name = 'Govee_H5074_5F2D';
        describe('with manufacturerData', () => {
          describe.each([
            '88ec00a0facc176402',
            '88ec00c408231d6402',
            '88ec001b0a9b196402',
          ])('%p', (manufacturerData) => {
            const device: DecodeDevice = {
              manufacturerData,
              name,
              serviceData: [
                {
                  uuid: uuidv4().replace('-', ''),
                  data: '041009760c',
                },
              ],
              uuid: uuidv4().replace('-', ''),
              macAddress: '0fd43832317d60ff',
            };
            it('matches', () => {
              expect(deviceMatches(device, conditions)).toBeTruthy();
            });
          });
          describe.each([
            '4c001219d0d18b5b1d35095e651a5b1f3051e288083f7715396306011b',
            '0288ec0001010180',
            '0184ec000101ac08ec0949',
            '0188ec000101ac08ec09',
            '18ec00a0facc176402',
            '88ed00c408231d6402',
            '89ec001b0a9b196402',
            'cf040400461b051700ffff2c01067300ffff2c01',
            'cf040400417f205600ffff2c01059100ffff2c010',
            'cf040400417f205600ffff2c01049100ffff2c010',
          ])('%s', (manufacturerData) => {
            const device: DecodeDevice = {
              manufacturerData,
              name,
              serviceData: [
                {
                  uuid: uuidv4().replace('-', ''),
                  data: '041009760c',
                },
              ],
              uuid: uuidv4().replace('-', ''),
              macAddress: '0fd43832317d60ff',
            };
            it('does not match', () => {
              expect(deviceMatches(device, conditions)).toBeFalsy();
            });
          });
        });
      });
      describe.each(['Govee_H5106', 'ihoment_611A', 'Apple HomePod'])(
        '%p',
        (name: string) => {
          const device: DecodeDevice = {
            manufacturerData:
              '010001010d20c75f4c000215494e54454c4c495f524f434b535f48575075f2ff0c',
            name,
            serviceData: [
              {
                uuid: uuidv4().replace('-', ''),
                data: '041009760c',
              },
            ],
            uuid: uuidv4().replace('-', ''),
            macAddress: '0fd43832317d60ff',
          };
          it('does not match', () => {
            expect(deviceMatches(device, conditions)).toBeFalsy();
          });
        },
      );
    });
  });
});
