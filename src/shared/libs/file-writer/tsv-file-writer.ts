import { once } from 'node:events';
import { WriteStream, createWriteStream } from 'node:fs';
import { finished } from 'node:stream/promises';
import { FileWriter } from './file-writer.interface.js';

export class TSVFileWriter implements FileWriter {
  private readonly stream: WriteStream;

  constructor(filename: string) {
    this.stream = createWriteStream(filename, {
      flags: 'w',
      encoding: 'utf-8',
      autoClose: true,
    });
  }

  public async write(row: string): Promise<void> {
    if (!this.stream.write(`${row}\n`)) {
      await once(this.stream, 'drain');
    }
  }

  public async end(): Promise<void> {
    this.stream.end();
    await finished(this.stream);
  }
}
