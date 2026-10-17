import { defaultClasses, getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { Cities, City, Good, Goods, Location, OfferType, OfferTypes } from '../../types/index.js';
import { UserEntity } from '../user/index.js';

class LocationEntity implements Location {
  @prop({ required: true })
  public latitude!: number;

  @prop({ required: true })
  public longitude!: number;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging, @typescript-eslint/no-empty-object-type
export interface OfferEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'offers',
  }
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class OfferEntity extends defaultClasses.TimeStamps {
  @prop({ required: true, trim: true })
  public title!: string;

  @prop({ required: true, trim: true })
  public description!: string;

  @prop({ required: true })
  public postDate!: Date;

  @prop({ required: true, type: () => String, enum: Cities })
  public city!: City;

  @prop({ required: true })
  public previewImage!: string;

  @prop({ required: true, type: () => [String] })
  public images!: string[];

  @prop({ required: true })
  public isPremium!: boolean;

  @prop({ required: true })
  public isFavorite!: boolean;

  @prop({ required: true })
  public rating!: number;

  @prop({ required: true, type: () => String, enum: OfferTypes })
  public type!: OfferType;

  @prop({ required: true })
  public bedrooms!: number;

  @prop({ required: true })
  public maxAdults!: number;

  @prop({ required: true })
  public price!: number;

  @prop({ required: true, type: () => [String], enum: Goods })
  public goods!: Good[];

  @prop({ required: true, ref: () => UserEntity })
  public authorId!: Ref<UserEntity>;

  @prop({ default: 0 })
  public commentCount!: number;

  @prop({ required: true, type: () => LocationEntity, _id: false })
  public location!: LocationEntity;
}

export const OfferModel = getModelForClass(OfferEntity);
