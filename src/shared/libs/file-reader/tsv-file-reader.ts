import EventEmitter from 'node:events';
import { createReadStream } from 'node:fs';
import { FileReader } from './file-reader.interface.js';

const CHUNK_SIZE = 16384; // 16KB

type TSVFileReaderEvents = {
  line: [line: string, lineNumber: number];
  end: [importedRowCount: number];
};

export class TSVFileReader extends EventEmitter<TSVFileReaderEvents> implements FileReader {
  constructor(
    private readonly filename: string
  ) {
    super();
  }

  public async read(): Promise<void> {
    const readStream = createReadStream(this.filename, {
      highWaterMark: CHUNK_SIZE,
      encoding: 'utf-8',
    });

    let remainingData = '';
    let lineNumber = 0;
    let importedRowCount = 0;

    const handleLine = (line: string) => {
      lineNumber++;
      if (line.trim().length > 0) {
        importedRowCount++;
        this.emit('line', line.replace(/\r$/, ''), lineNumber);
      }
    };

    for await (const chunk of readStream) {
      remainingData += chunk;

      let nextLinePosition: number;
      while ((nextLinePosition = remainingData.indexOf('\n')) >= 0) {
        handleLine(remainingData.slice(0, nextLinePosition));
        remainingData = remainingData.slice(nextLinePosition + 1);
      }
    }

    handleLine(remainingData);
    this.emit('end', importedRowCount);
  }
}
