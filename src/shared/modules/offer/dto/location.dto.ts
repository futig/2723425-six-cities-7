import { IsLatitude, IsLongitude } from 'class-validator';
import { Location } from '../../../types/index.js';

export class LocationDto implements Location {
  @IsLatitude()
  public latitude!: number;

  @IsLongitude()
  public longitude!: number;
}
