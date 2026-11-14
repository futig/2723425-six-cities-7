import { inject, injectable } from 'inversify';
import express, { Express } from 'express';
import { Logger } from '../shared/libs/logger/index.js';
import { Config, RestSchema } from '../shared/libs/config/index.js';
import { DatabaseClient } from '../shared/libs/database-client/index.js';
import { Controller, ExceptionFilter } from '../shared/libs/rest/index.js';
import { getMongoURI } from '../shared/helpers/index.js';
import { Component } from '../shared/types/index.js';

@injectable()
export class RestApplication {
  private readonly server: Express;

  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
    @inject(Component.DatabaseClient) private readonly databaseClient: DatabaseClient,
    @inject(Component.ExceptionFilter) private readonly appExceptionFilter: ExceptionFilter,
    @inject(Component.UserController) private readonly userController: Controller,
    @inject(Component.OfferController) private readonly offerController: Controller,
    @inject(Component.FavoriteController) private readonly favoriteController: Controller,
  ) {
    this.server = express();
  }

  private async initDb(): Promise<void> {
    const mongoUri = getMongoURI(
      this.config.get('DB_USER'),
      this.config.get('DB_PASSWORD'),
      this.config.get('DB_HOST'),
      this.config.get('DB_PORT'),
      this.config.get('DB_NAME'),
    );

    return this.databaseClient.connect(mongoUri);
  }

  private initMiddleware(): void {
    this.server.use(express.json());
  }

  private initControllers(): void {
    this.server.use('/users', this.userController.router);
    this.server.use('/offers', this.offerController.router);
    this.server.use('/favorites', this.favoriteController.router);
  }

  private initExceptionFilters(): void {
    this.server.use(this.appExceptionFilter.catch.bind(this.appExceptionFilter));
  }

  private initServer(): Promise<void> {
    const port = this.config.get('PORT');

    return new Promise((resolve, reject) => {
      this.server.listen(port, (error) => (error ? reject(error) : resolve()));
    });
  }

  public async init(): Promise<void> {
    this.logger.info('Application initialization');

    this.logger.info('Init database…');
    await this.initDb();
    this.logger.info('Init database completed');

    this.logger.info('Init app-level middleware…');
    this.initMiddleware();
    this.logger.info('App-level middleware initialization completed');

    this.logger.info('Init controllers…');
    this.initControllers();
    this.logger.info('Controllers initialization completed');

    this.logger.info('Init exception filters…');
    this.initExceptionFilters();
    this.logger.info('Exception filters initialization completed');

    this.logger.info('Try to init server…');
    await this.initServer();
    this.logger.info(`Server started on http://localhost:${this.config.get('PORT')}`);
  }
}
