import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { FileReader, FileWriter } from './persist.providers';

@Injectable()
export class PersistService {
  private readonly logger: Logger = new Logger(PersistService.name);
  constructor(
    @Inject(FileReader.provide) private readonly reader: FileReader,
    @Inject(FileWriter.provide) private readonly writer: FileWriter,
  ) {}

  async persist<T>(data: T, where: string | undefined = undefined) {
    if (where === undefined) {
      return;
    }

    await this.writer(where, JSON.stringify(data), { encoding: 'utf-8' });
  }

  async retreive<T>(
    as: ClassConstructor<T>,
    where: string | undefined,
  ): Promise<T | undefined> {
    if (where === undefined) {
      return undefined;
    }
    const contents = await this.reader(where, { encoding: 'utf-8' });
    return plainToInstance(as, JSON.parse(contents) as T);
  }
}
