import { Request } from 'express';
import { RequestBody } from '../../libs/rest/index.js';
import { ParamOfferId } from '../offer/offer-request.type.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';

export type CommentListRequest = Request<ParamOfferId>;
export type CreateCommentRequest = Request<ParamOfferId, RequestBody, CreateCommentDto>;
