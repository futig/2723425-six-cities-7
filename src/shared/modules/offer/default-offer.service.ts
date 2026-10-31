import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import { OfferService } from './offer-service.interface.js';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { DEFAULT_OFFER_COUNT, PREMIUM_OFFER_COUNT } from './offer.constant.js';
import { Logger } from '../../libs/logger/index.js';
import { City, Component, SortType } from '../../types/index.js';
import { UserEntity } from '../user/index.js';
import type { CommentEntity } from '../comment/index.js';

@injectable()
export class DefaultOfferService implements OfferService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.OfferModel) private readonly offerModel: types.ModelType<OfferEntity>,
    @inject(Component.UserModel) private readonly userModel: types.ModelType<UserEntity>,
    @inject(Component.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>
  ) {}

  public async create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>> {
    const result = await this.offerModel.create(dto);
    this.logger.info(`New offer created: ${dto.title}`);

    return result;
  }

  public async findById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findById(offerId)
      .populate('authorId')
      .exec();
  }

  public async find(count = DEFAULT_OFFER_COUNT): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find()
      .sort({ postDate: SortType.Down })
      .limit(count)
      .populate('authorId')
      .exec();
  }

  public async findPremiumByCity(city: City): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({ city, isPremium: true })
      .sort({ postDate: SortType.Down })
      .limit(PREMIUM_OFFER_COUNT)
      .populate('authorId')
      .exec();
  }

  public async findFavorites(userId: string): Promise<DocumentType<OfferEntity>[]> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      return [];
    }

    return this.offerModel
      .find({ _id: { $in: user.favorites } })
      .sort({ postDate: SortType.Down })
      .populate('authorId')
      .exec();
  }

  public async updateById(offerId: string, dto: UpdateOfferDto): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(offerId, dto, { returnDocument: 'after' })
      .populate('authorId')
      .exec();
  }

  public async deleteById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    const result = await this.offerModel
      .findByIdAndDelete(offerId)
      .exec();

    if (result) {
      await this.commentModel.deleteMany({ offerId }).exec();
      await this.userModel.updateMany({ favorites: offerId }, { $pull: { favorites: offerId } }).exec();
    }

    return result;
  }

  public async exists(offerId: string): Promise<boolean> {
    return (await this.offerModel.exists({ _id: offerId })) !== null;
  }

  public async isAuthor(offerId: string, userId: string): Promise<boolean> {
    return (await this.offerModel.exists({ _id: offerId, authorId: userId })) !== null;
  }

  public async incCommentCount(offerId: string, commentRating: number): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(offerId, [
        {
          $set: {
            rating: {
              $divide: [
                { $add: [{ $multiply: ['$rating', '$commentCount'] }, commentRating] },
                { $add: ['$commentCount', 1] },
              ],
            },
            commentCount: { $add: ['$commentCount', 1] },
          },
        },
      ], { returnDocument: 'after', updatePipeline: true })
      .exec();
  }
}
