import chalk from 'chalk';
import { Command } from './command.interface.js';
import { DEFAULT_USER_PASSWORD } from './command.constant.js';
import { TSVFileReader } from '../../shared/libs/file-reader/index.js';
import { createOffer, getErrorMessage, getMongoURI } from '../../shared/helpers/index.js';
import { ConsoleLogger, Logger } from '../../shared/libs/logger/index.js';
import { Config, RestConfig, RestSchema } from '../../shared/libs/config/index.js';
import { DatabaseClient, MongoDatabaseClient } from '../../shared/libs/database-client/index.js';
import { DefaultUserService, UserModel, UserService } from '../../shared/modules/user/index.js';
import { DefaultOfferService, OfferModel, OfferService } from '../../shared/modules/offer/index.js';
import { CommentModel } from '../../shared/modules/comment/index.js';
import { Offer } from '../../shared/types/index.js';

export class ImportCommand implements Command {
  private readonly logger: Logger;
  private readonly databaseClient: DatabaseClient;
  private readonly userService: UserService;
  private readonly offerService: OfferService;
  private salt = '';
  private failedRowCount = 0;

  constructor() {
    this.logger = new ConsoleLogger();
    this.databaseClient = new MongoDatabaseClient(this.logger);
    this.userService = new DefaultUserService(this.logger, UserModel);
    this.offerService = new DefaultOfferService(this.logger, OfferModel, UserModel, CommentModel);
  }

  public getName(): string {
    return '--import';
  }

  private onImportedLine = async (line: string, lineNumber: number, resolve: () => void): Promise<void> => {
    try {
      await this.saveOffer(createOffer(line));
    } catch (error: unknown) {
      this.failedRowCount++;
      console.error(chalk.red(`Row ${lineNumber}: ${getErrorMessage(error)}`));
    } finally {
      resolve();
    }
  };

  private onCompleteImport = (count: number): void => {
    console.info(chalk.green(`${count - this.failedRowCount} rows imported.`));

    if (this.failedRowCount > 0) {
      console.error(chalk.red(`${this.failedRowCount} rows failed.`));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async saveOffer({ author, isFavorite, rating, ...offerData }: Offer): Promise<void> {
    const user = await this.userService.findOrCreate({
      ...author,
      password: DEFAULT_USER_PASSWORD,
    }, this.salt);

    await this.offerService.create({ ...offerData, authorId: user.id });
  }

  public async execute(...parameters: string[]): Promise<void> {
    const [filename, login, password, host, dbname] = parameters;

    if (!filename || !login || !password || !host || !dbname) {
      console.error(chalk.red('Usage: --import <path> <login> <password> <host> <dbname>'));
      return;
    }

    let config: Config<RestSchema>;
    try {
      config = new RestConfig(this.logger);
    } catch (error: unknown) {
      console.error(chalk.red('Can\'t read settings from .env file'));
      console.error(chalk.red(`Details: ${getErrorMessage(error)}`));
      return;
    }

    this.salt = config.get('SALT');
    this.failedRowCount = 0;

    try {
      await this.databaseClient.connect(getMongoURI(login, password, host, config.get('DB_PORT'), dbname));
    } catch (error: unknown) {
      console.error(chalk.red('Can\'t connect to the database'));
      console.error(chalk.red(`Details: ${getErrorMessage(error)}`));
      return;
    }

    const fileReader = new TSVFileReader(filename.trim());
    fileReader.on('line', this.onImportedLine);
    fileReader.on('end', this.onCompleteImport);

    try {
      await fileReader.read();
    } catch (error: unknown) {
      console.error(chalk.red(`Can't import data from file: ${filename}`));
      console.error(chalk.red(`Details: ${getErrorMessage(error)}`));
    } finally {
      await this.databaseClient.disconnect();
    }
  }
}
