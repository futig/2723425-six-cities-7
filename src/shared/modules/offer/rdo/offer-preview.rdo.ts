import { Expose, Transform } from 'class-transformer';
import { City, OfferType } from '../../../types/index.js';

export class OfferPreviewRdo {
  @Expose()
  public id!: string;

  @Expose()
  public title!: string;

  @Expose()
  public type!: OfferType;

  @Expose()
  public price!: number;

  @Expose()
  public city!: City;

  @Expose()
  public previewImage!: string;

  @Expose()
  public isPremium!: boolean;

  @Expose()
  @Transform(({ value }) => value ?? false)
  public isFavorite!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public postDate!: Date;

  @Expose()
  public commentCount!: number;
}
