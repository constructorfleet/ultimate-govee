import { Conditions, DecodeDevice } from './types';
import { propertyMatches } from './property.condition';
import { v4 as uuidv4 } from 'uuid';

const makeDevice = (name: string, manufacturerData: string): DecodeDevice => ({
  id: '0B:00:19:3D:31:51:34:F7',
  name,
  manufacturerData,
  serviceData: [
    {
      uuid: uuidv4().replace('-', ''),
      data: '041009760c',
    },
  ],
  uuid: uuidv4().replace('-', ''),
  macAddress: '0fd43832317d60ff',
});

describe('propertyMatches', () => {
  describe('H5106', () => {
    const name = '';
    describe.each(['010001010d01cdb4'])(
      'with manufacturerData %p',
      (manufacturerData) => {
        const device = makeDevice(name, manufacturerData);
        describe("against conditon ['manufacturerdata', 8, 'bit', 3, 0]", () => {
          const conditions = ['manufacturerdata', 8, 'bit', 3, 0] as Conditions;
          it('should return true', () => {
            expect(propertyMatches(device, conditions)).toBe(true);
          });
        });
        describe("against conditon ['manufacturerdata', 8, 'bit', 3, 1]", () => {
          const conditions = ['manufacturerdata', 8, 'bit', 3, 1] as Conditions;
          it('should return false', () => {
            expect(propertyMatches(device, conditions)).toBe(false);
          });
        });
      },
    );
    describe.each(['010001018d01cdb4'])(
      'with manufacturerData %p',
      (manufacturerData) => {
        const device = makeDevice(name, manufacturerData);
        describe("against conditon ['manufacturerdata', 8, 'bit', 3, 0]", () => {
          const conditions = ['manufacturerdata', 8, 'bit', 3, 0] as Conditions;
          it('should return false', () => {
            expect(propertyMatches(device, conditions)).toBe(false);
          });
        });
        describe("against conditon ['manufacturerdata', 8, 'bit', 3, 1]", () => {
          const conditions = ['manufacturerdata', 8, 'bit', 3, 1] as Conditions;
          it('should return true', () => {
            expect(propertyMatches(device, conditions)).toBe(true);
          });
        });
      },
    );
  });
});
