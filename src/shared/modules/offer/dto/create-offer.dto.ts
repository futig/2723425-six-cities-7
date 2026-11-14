import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDefined,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Cities, City, Good, Goods, Location, OfferType, OfferTypes } from '../../../types/index.js';
import { LocationDto } from './location.dto.js';

export class CreateOfferDto {
  @IsString()
  @Length(10, 100)
  public title!: string;

  @IsString()
  @Length(20, 1024)
  public description!: string;

  @IsOptional()
  public postDate!: Date;

  @IsIn([...Cities])
  public city!: City;

  @IsUrl()
  public previewImage!: string;

  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  @IsUrl({}, { each: true })
  public images!: string[];

  @IsBoolean()
  public isPremium!: boolean;

  @IsIn([...OfferTypes])
  public type!: OfferType;

  @IsInt()
  @Min(1)
  @Max(8)
  public bedrooms!: number;

  @IsInt()
  @Min(1)
  @Max(10)
  public maxAdults!: number;

  @IsInt()
  @Min(100)
  @Max(100000)
  public price!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsIn([...Goods], { each: true })
  public goods!: Good[];

  @IsMongoId()
  public authorId!: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => LocationDto)
  public location!: Location;
}
