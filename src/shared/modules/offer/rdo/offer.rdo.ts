import { Expose, Type } from 'class-transformer';
import { OfferPreviewRdo } from './offer-preview.rdo.js';
import { LocationRdo } from './location.rdo.js';
import { Good } from '../../../types/index.js';
import { UserRdo } from '../../user/index.js';

export class OfferRdo extends OfferPreviewRdo {
  @Expose()
  public description!: string;

  @Expose()
  public images!: string[];

  @Expose()
  public bedrooms!: number;

  @Expose()
  public maxAdults!: number;

  @Expose()
  public goods!: Good[];

  @Expose({ name: 'authorId' })
  @Type(() => UserRdo)
  public author!: UserRdo;

  @Expose()
  @Type(() => LocationRdo)
  public location!: LocationRdo;
}
