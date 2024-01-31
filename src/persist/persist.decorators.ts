import { Logger } from '@nestjs/common';
import { Optional } from '@govee/common';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

export type PersistOptions = {
  path?: Optional<string>;
  filename: string;
  writeOption?: {
    encoding?: null | undefined;
  };
  transform?: (data: any) => any;
};

export function PersistResult(options: PersistOptions) {
  const logger: Logger = new Logger('PersistResult');
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    // eslint-disable-next-line func-names
    descriptor.value = async function (...args: any[]) {
      const result = await original.apply(this, args);
      if (options.path !== undefined && !existsSync(options.path)) {
        await mkdir(options.path, { recursive: true });
      }
      logger.log('Writing Data');
      const filePath = join(options.path ?? '.', options.filename);
      const writeData =
        options.transform === undefined ? result : options.transform(result);
      await writeFile(
        args.reduce(
          (fp: string, arg: any, index: number) =>
            fp.replace(`{${index}}`, arg),
          filePath,
        ),
        JSON.stringify(writeData, null, 2),
        options.writeOption,
      );

      return result;
    };
  };
}
