import chalk from 'chalk';
import got from 'got';
import { Command } from './command.interface.js';
import { MockServerData } from '../../shared/types/index.js';
import { TSVOfferGenerator } from '../../shared/libs/offer-generator/index.js';
import { TSVFileWriter } from '../../shared/libs/file-writer/index.js';
import { getErrorMessage } from '../../shared/helpers/index.js';

export class GenerateCommand implements Command {
  public getName(): string {
    return '--generate';
  }

  private async load(url: string): Promise<MockServerData> {
    try {
      return await got.get(url).json<MockServerData>();
    } catch {
      throw new Error(`Can't load data from ${url}`);
    }
  }

  private async write(filepath: string, offerCount: number, mockData: MockServerData): Promise<void> {
    const tsvOfferGenerator = new TSVOfferGenerator(mockData);
    const tsvFileWriter = new TSVFileWriter(filepath);

    for (let i = 0; i < offerCount; i++) {
      await tsvFileWriter.write(tsvOfferGenerator.generate());
    }

    await tsvFileWriter.end();
  }

  public async execute(...parameters: string[]): Promise<void> {
    const [count, filepath, url] = parameters;
    const offerCount = Number(count);

    if (!Number.isInteger(offerCount) || offerCount <= 0 || !filepath || !url) {
      console.error(chalk.red('Usage: --generate <n> <filepath> <url>, where n is a positive integer'));
      return;
    }

    try {
      const mockData = await this.load(url);
      await this.write(filepath, offerCount, mockData);
      console.info(chalk.green(`File ${filepath} was created!`));
    } catch (error: unknown) {
      console.error(chalk.red('Can\'t generate data'));
      console.error(chalk.red(`Details: ${getErrorMessage(error)}`));
    }
  }
}
