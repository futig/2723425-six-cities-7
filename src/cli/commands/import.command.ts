import chalk from 'chalk';
import { Command } from './command.interface.js';
import { TSVFileReader } from '../../shared/libs/file-reader/index.js';
import { createOffer, getErrorMessage } from '../../shared/helpers/index.js';

export class ImportCommand implements Command {
  private failedRowCount = 0;

  public getName(): string {
    return '--import';
  }

  private onImportedLine = (line: string, lineNumber: number): void => {
    try {
      console.info(createOffer(line));
    } catch (error: unknown) {
      this.failedRowCount++;
      console.error(chalk.red(`Row ${lineNumber}: ${getErrorMessage(error)}`));
    }
  };

  private onCompleteImport = (count: number): void => {
    console.info(chalk.green(`${count - this.failedRowCount} rows imported.`));

    if (this.failedRowCount > 0) {
      console.error(chalk.red(`${this.failedRowCount} rows failed.`));
    }
  };

  public async execute(...parameters: string[]): Promise<void> {
    const [filename] = parameters;

    if (!filename) {
      console.error(chalk.red('Path to TSV file is required: --import <path>'));
      return;
    }

    this.failedRowCount = 0;
    const fileReader = new TSVFileReader(filename.trim());
    fileReader.on('line', this.onImportedLine);
    fileReader.on('end', this.onCompleteImport);

    try {
      await fileReader.read();
    } catch (error: unknown) {
      console.error(chalk.red(`Can't import data from file: ${filename}`));
      console.error(chalk.red(`Details: ${getErrorMessage(error)}`));
    }
  }
}
