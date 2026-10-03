import { City } from './city.type.js';
import { Good } from './good.type.js';
import { Location } from './location.type.js';
import { OfferType } from './offer-type.type.js';
import { User } from './user.type.js';

export type Offer = {
  title: string;
  description: string;
  postDate: Date;
  city: City;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  type: OfferType;
  bedrooms: number;
  maxAdults: number;
  price: number;
  goods: Good[];
  author: User;
  location: Location;
}
