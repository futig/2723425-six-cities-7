import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  ValidateIf,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Cities, City, Good, Goods, Location, OfferType, OfferTypes } from '../../../types/index.js';
import { LocationDto } from './location.dto.js';

export class UpdateOfferDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Length(10, 100)
  public title?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Length(20, 1024)
  public description?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsIn([...Cities])
  public city?: City;

  @ValidateIf((_, value) => value !== undefined)
  @IsUrl()
  public previewImage?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  @IsUrl({}, { each: true })
  public images?: string[];

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  public isPremium?: boolean;

  @ValidateIf((_, value) => value !== undefined)
  @IsIn([...OfferTypes])
  public type?: OfferType;

  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(8)
  public bedrooms?: number;

  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(10)
  public maxAdults?: number;

  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(100)
  @Max(100000)
  public price?: number;

  @ValidateIf((_, value) => value !== undefined)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsIn([...Goods], { each: true })
  public goods?: Good[];

  @ValidateIf((_, value) => value !== undefined)
  @ValidateNested()
  @Type(() => LocationDto)
  public location?: Location;
}
