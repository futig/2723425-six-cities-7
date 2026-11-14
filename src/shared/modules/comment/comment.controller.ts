import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { fillDTO } from '../../helpers/index.js';
import { Logger } from '../../libs/logger/index.js';
import {
  BaseController,
  HttpError,
  HttpMethod,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware,
} from '../../libs/rest/index.js';
import { Component } from '../../types/index.js';
import { OfferService } from '../offer/index.js';
import { UserService } from '../user/index.js';
import { CommentService } from './comment-service.interface.js';
import { CommentListRequest, CreateCommentRequest } from './comment-request.type.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { CommentRdo } from './rdo/comment.rdo.js';

@injectable()
export class CommentController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.CommentService) private readonly commentService: CommentService,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.UserService) private readonly userService: UserService,
  ) {
    super(logger);
    this.logger.info('Register routes for CommentController…');

    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [new ValidateObjectIdMiddleware('offerId')],
    });
    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(CreateCommentDto),
      ],
    });
  }

  public async index({ params }: CommentListRequest, res: Response): Promise<void> {
    await this.ensureOfferExists(params.offerId);
    const comments = await this.commentService.findByOfferId(params.offerId);
    this.ok(res, fillDTO(CommentRdo, comments));
  }

  public async create({ params, body }: CreateCommentRequest, res: Response): Promise<void> {
    await this.ensureOfferExists(params.offerId);
    await this.ensureAuthorExists(body.authorId);
    const comment = await this.commentService.create(params.offerId, body);
    this.created(res, fillDTO(CommentRdo, comment));
  }

  private async ensureAuthorExists(authorId: string): Promise<void> {
    if (!await this.userService.findById(authorId)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `Author with id ${authorId} not found.`,
        'CommentController',
      );
    }
  }

  private async ensureOfferExists(offerId: string): Promise<void> {
    if (!await this.offerService.exists(offerId)) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found.`,
        'CommentController',
      );
    }
  }
}
