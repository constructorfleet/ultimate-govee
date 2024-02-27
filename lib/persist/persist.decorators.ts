import { Optional } from '~ultimate-govee-common';
import { existsSync } from 'fs';
import { mkdir, writeFile, appendFile } from 'fs/promises';
import { join } from 'path';
import stringify from 'json-stringify-safe';
import { PersistModule } from './persist.module';

export type PersistOptions = {
  path?: Optional<string>;
  filename: string;
  writeOption?: {
    encoding?: null | undefined;
  };
  append?: boolean;
  transform?: (data: any) => any;
};

export function PersistResult(options: PersistOptions) {
  return (_: any, __: string, descriptor: PropertyDescriptor) => {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    const original = descriptor.value;
    // eslint-disable-next-line func-names
    descriptor.value = async function (...args: any[]) {
      const result = await original.apply(this, args);
      const dirPath =
        options.path !== undefined
          ? join(PersistModule.persistRootDirectory, options.path)
          : PersistModule.persistRootDirectory;

      if (dirPath !== undefined && !existsSync(dirPath)) {
        await mkdir(dirPath, { recursive: true });
      }
      const filePath = join(dirPath ?? '.', options.filename);
      const resolvedPath = args.reduce(
        (fp: string, arg: any, index: number) => fp.replace(`{${index}}`, arg),
        filePath,
      );
      // logger.debug(`Persisting result to ${resolvedPath}`);
      const writeData =
        options.transform === undefined ? result : options.transform(result);
      if (options.append === true) {
        await appendFile(resolvedPath, stringify(writeData, null, 2), {
          ...options.writeOption,
        });
      } else {
        await writeFile(resolvedPath, stringify(writeData, null, 2), {
          ...options.writeOption,
        });
      }
      return result;
    };
  };
}
