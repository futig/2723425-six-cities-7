import { Response } from 'express';
import { inject, injectable } from 'inversify';
import { fillDTO } from '../../helpers/index.js';
import { Logger } from '../../libs/logger/index.js';
import {
  BaseController,
  DocumentExistsMiddleware,
  HttpMethod,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware,
} from '../../libs/rest/index.js';
import { Component } from '../../types/index.js';
import { OfferPreviewRdo, OfferRdo, OfferService } from '../offer/index.js';
import { UserService } from '../user/index.js';
import { FavoriteQueryDto } from './dto/favorite-query.dto.js';
import { FavoriteIndexRequest, FavoriteOfferRequest } from './favorite-request.type.js';

@injectable()
export class FavoriteController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.UserService) private readonly userService: UserService,
  ) {
    super(logger);
    this.logger.info('Register routes for FavoriteController…');

    this.addRoute({
      path: '/',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [
        new ValidateDtoMiddleware(FavoriteQueryDto, 'query'),
        new DocumentExistsMiddleware(this.userService, 'User', 'userId', 'query'),
      ],
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Post,
      handler: this.add,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(FavoriteQueryDto, 'query'),
        new DocumentExistsMiddleware(this.userService, 'User', 'userId', 'query'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ],
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.remove,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(FavoriteQueryDto, 'query'),
        new DocumentExistsMiddleware(this.userService, 'User', 'userId', 'query'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ],
    });
  }

  public async index({ query }: FavoriteIndexRequest, res: Response): Promise<void> {
    const offers = await this.offerService.findFavorites(query.userId!);
    const favorites = offers.map((offer) => ({
      ...offer.toObject({ virtuals: true }),
      isFavorite: true,
    }));

    this.ok(res, fillDTO(OfferPreviewRdo, favorites));
  }

  public async add({ params, query }: FavoriteOfferRequest, res: Response): Promise<void> {
    const offer = (await this.offerService.findById(params.offerId))!;
    await this.userService.addToFavorites(query.userId!, params.offerId);

    this.ok(res, fillDTO(OfferRdo, {
      ...offer.toObject({ virtuals: true }),
      isFavorite: true,
    }));
  }

  public async remove({ params, query }: FavoriteOfferRequest, res: Response): Promise<void> {
    const offer = (await this.offerService.findById(params.offerId))!;
    await this.userService.removeFromFavorites(query.userId!, params.offerId);

    this.ok(res, fillDTO(OfferRdo, {
      ...offer.toObject({ virtuals: true }),
      isFavorite: false,
    }));
  }
}
