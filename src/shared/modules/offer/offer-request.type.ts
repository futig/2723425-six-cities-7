import { Request } from 'express';
import { RequestBody } from '../../libs/rest/index.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';

export type ParamOfferId = {
  offerId: string;
};

export type QueryOffers = {
  limit?: string;
};

export type QueryPremiumOffers = {
  city?: string;
};

export type IndexOffersRequest = Request<Record<string, never>, RequestBody, RequestBody, QueryOffers>;
export type PremiumOffersRequest = Request<Record<string, never>, RequestBody, RequestBody, QueryPremiumOffers>;
export type OfferIdRequest = Request<ParamOfferId>;
export type CreateOfferRequest = Request<Record<string, never>, RequestBody, Omit<CreateOfferDto, 'postDate'>>;
export type UpdateOfferRequest = Request<ParamOfferId, RequestBody, UpdateOfferDto>;
