import { Inject, Injectable, Logger } from '@nestjs/common';
import { Optional } from '~ultimate-govee-common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { FileReader, FileWriter } from './persist.providers';
import stringify from 'json-stringify-safe';

@Injectable()
export class PersistService {
  private readonly logger: Logger = new Logger(PersistService.name);
  constructor(
    @Inject(FileReader.provide) private readonly reader: FileReader,
    @Inject(FileWriter.provide) private readonly writer: FileWriter,
  ) {}

  async persist<T>(data: T, where: Optional<string> = undefined) {
    if (where === undefined) {
      return;
    }
    await this.writer(where, stringify(data), { encoding: 'utf-8' });
  }

  async retreive<T>(
    as: ClassConstructor<T>,
    where: Optional<string>,
  ): Promise<Optional<T>> {
    if (where === undefined) {
      return undefined;
    }
    const contents = await this.reader(where, { encoding: 'utf-8' });
    return plainToInstance(as, JSON.parse(contents) as T);
  }
}
