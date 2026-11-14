import { inject, injectable } from 'inversify';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  BaseController,
  DocumentExistsMiddleware,
  HttpError,
  HttpMethod,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware,
} from '../../libs/rest/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Component, isCity } from '../../types/index.js';
import { fillDTO } from '../../helpers/index.js';
import { OfferService } from './offer-service.interface.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { UserService } from '../user/index.js';
import { OfferPreviewRdo } from './rdo/offer-preview.rdo.js';
import { OfferRdo } from './rdo/offer.rdo.js';
import {
  CreateOfferRequest,
  IndexOffersRequest,
  OfferIdRequest,
  PremiumOffersRequest,
  UpdateOfferRequest,
} from './offer-request.type.js';

@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.UserService) private readonly userService: UserService,
  ) {
    super(logger);
    this.logger.info('Register routes for OfferController…');

    this.addRoute({ path: '/', method: HttpMethod.Get, handler: this.index });
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new ValidateDtoMiddleware(CreateOfferDto),
        new DocumentExistsMiddleware(
          this.userService,
          'Author',
          'authorId',
          'body',
          StatusCodes.BAD_REQUEST,
        ),
      ],
    });
    this.addRoute({ path: '/premium', method: HttpMethod.Get, handler: this.getPremium });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.show,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ],
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Patch,
      handler: this.update,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(UpdateOfferDto),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ],
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ],
    });
  }

  public async index({ query }: IndexOffersRequest, res: Response): Promise<void> {
    const limit = query.limit === undefined ? undefined : Number(query.limit);

    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `Invalid limit "${query.limit}". Expected a positive integer.`,
        'OfferController',
      );
    }

    const offers = await this.offerService.find(limit);
    this.ok(res, fillDTO(OfferPreviewRdo, offers));
  }

  public async create({ body }: CreateOfferRequest, res: Response): Promise<void> {
    const result = await this.offerService.create({ ...body, postDate: new Date() });
    const offer = await this.offerService.findById(result.id);
    this.created(res, fillDTO(OfferRdo, offer));
  }

  public async getPremium({ query }: PremiumOffersRequest, res: Response): Promise<void> {
    const city = isCity(query.city ?? '');

    if (!city) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `Unknown city "${query.city}".`,
        'OfferController',
      );
    }

    const offers = await this.offerService.findPremiumByCity(city);
    this.ok(res, fillDTO(OfferPreviewRdo, offers));
  }

  public async show({ params }: OfferIdRequest, res: Response): Promise<void> {
    const offer = await this.offerService.findById(params.offerId);
    this.ok(res, fillDTO(OfferRdo, offer));
  }

  public async update({ params, body }: UpdateOfferRequest, res: Response): Promise<void> {
    const offer = await this.offerService.updateById(params.offerId, body);
    this.ok(res, fillDTO(OfferRdo, offer));
  }

  public async delete({ params }: OfferIdRequest, res: Response): Promise<void> {
    await this.offerService.deleteById(params.offerId);
    this.noContent(res);
  }
}
