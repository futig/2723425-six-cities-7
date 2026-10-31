import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BaseController, HttpError, HttpMethod } from '../../libs/rest/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';

@injectable()
export class FavoriteController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
  ) {
    super(logger);
    this.logger.info('Register routes for FavoriteController…');

    this.addRoute({ path: '/', method: HttpMethod.Get, handler: this.index });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Post, handler: this.add });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Delete, handler: this.remove });
  }

  public async index(_req: Request, _res: Response): Promise<void> {
    throw this.createNotImplementedError();
  }

  public async add(_req: Request, _res: Response): Promise<void> {
    throw this.createNotImplementedError();
  }

  public async remove(_req: Request, _res: Response): Promise<void> {
    throw this.createNotImplementedError();
  }

  private createNotImplementedError(): HttpError {
    return new HttpError(StatusCodes.NOT_IMPLEMENTED, 'Not implemented', 'FavoriteController');
  }
}
