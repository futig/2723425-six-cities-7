import { inject, injectable } from 'inversify';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BaseController, HttpError, HttpMethod } from '../../libs/rest/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Component, isCity } from '../../types/index.js';
import { fillDTO } from '../../helpers/index.js';
import { OfferService } from './offer-service.interface.js';
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
  ) {
    super(logger);
    this.logger.info('Register routes for OfferController…');

    this.addRoute({ path: '/', method: HttpMethod.Get, handler: this.index });
    this.addRoute({ path: '/', method: HttpMethod.Post, handler: this.create });
    this.addRoute({ path: '/premium', method: HttpMethod.Get, handler: this.getPremium });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Get, handler: this.show });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Patch, handler: this.update });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Delete, handler: this.delete });
  }

  public async index({ query }: IndexOffersRequest, res: Response): Promise<void> {
    const limit = query.limit === undefined ? undefined : Number(query.limit);

    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `Invalid limit «${query.limit}». Expected a positive integer.`,
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
        `Unknown city «${query.city}».`,
        'OfferController',
      );
    }

    const offers = await this.offerService.findPremiumByCity(city);
    this.ok(res, fillDTO(OfferPreviewRdo, offers));
  }

  public async show({ params }: OfferIdRequest, res: Response): Promise<void> {
    const offer = await this.offerService.findById(params.offerId);

    if (!offer) {
      throw this.createNotFoundError(params.offerId);
    }

    this.ok(res, fillDTO(OfferRdo, offer));
  }

  public async update({ params, body }: UpdateOfferRequest, res: Response): Promise<void> {
    const offer = await this.offerService.updateById(params.offerId, body);

    if (!offer) {
      throw this.createNotFoundError(params.offerId);
    }

    this.ok(res, fillDTO(OfferRdo, offer));
  }

  public async delete({ params }: OfferIdRequest, res: Response): Promise<void> {
    const offer = await this.offerService.deleteById(params.offerId);

    if (!offer) {
      throw this.createNotFoundError(params.offerId);
    }

    this.noContent(res);
  }

  private createNotFoundError(offerId: string): HttpError {
    return new HttpError(
      StatusCodes.NOT_FOUND,
      `Offer with id «${offerId}» not found.`,
      'OfferController',
    );
  }
}
