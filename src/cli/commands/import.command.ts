import chalk from 'chalk';
import { Command } from './command.interface.js';
import { TSVFileReader } from '../../shared/libs/file-reader/index.js';

export class ImportCommand implements Command {
  public getName(): string {
    return '--import';
  }

  public execute(...parameters: string[]): void {
    const [filename] = parameters;

    if (!filename) {
      console.error(chalk.red('Path to TSV file is required: --import <path>'));
      return;
    }

    const fileReader = new TSVFileReader(filename.trim());

    try {
      fileReader.read();
      console.info(fileReader.toArray());
    } catch (error: unknown) {
      console.error(chalk.red(`Can't import data from file: ${filename}`));

      if (error instanceof Error) {
        console.error(chalk.red(`Details: ${error.message}`));
      }
    }
  }
}
