import { decodeH5106 } from './H5106.decoder';
import { decodeH5179 } from './H5179.decoder';
import { decodeH5184 } from './H5184.decoder';
import { decodeH5185 } from './H5185.decoder';
import { decodeH5198 } from './H5198.decoder';
import { decodeH5181 } from './H5181.decoder';
import { decodeH5182 } from './H5182.decoder';
import { decodeH5183 } from './H5183.decoder';

export const decodeDevice = {
  H5106: decodeH5106,
  H5179: decodeH5179,
  H5181: decodeH5181,
  H5182: decodeH5182,
  H5183: decodeH5183,
  H5184: decodeH5184,
  H5185: decodeH5185,
  H5198: decodeH5198,
};
