import { Request } from 'express';
import { RequestBody } from '../../libs/rest/index.js';
import { ParamOfferId } from '../offer/offer-request.type.js';

type FavoriteQuery = {
  userId?: string;
};

export type FavoriteIndexRequest = Request<
  Record<string, never>,
  RequestBody,
  RequestBody,
  FavoriteQuery
>;

export type FavoriteOfferRequest = Request<
  ParamOfferId,
  RequestBody,
  RequestBody,
  FavoriteQuery
>;
