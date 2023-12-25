import { readPkcs12 } from 'pem';
import type { Pkcs12ReadOptions, Pkcs12ReadResult } from 'pem';
import NodeRSA from 'node-rsa';
import { promisify } from 'util';

export type CertificateBundle = {
  certificate: string;
  privateKey: string;
};

export const parseP12Certificate = async (
  certificate: string,
  p12Password: string,
): Promise<CertificateBundle> => {
  try {
    const cert = await promisify<Buffer, Pkcs12ReadOptions, Pkcs12ReadResult>(
      readPkcs12,
    )(Buffer.from(certificate), { p12Password });
    const key: NodeRSA = new NodeRSA(cert.key);
    return {
      certificate: cert.cert,
      privateKey: key.exportKey('pkcs8'),
    };
  } catch (err) {
    throw new Error('Invalid P12 certificate');
  }
};
