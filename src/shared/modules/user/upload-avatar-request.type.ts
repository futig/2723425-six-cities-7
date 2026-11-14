import { Request } from 'express';

export type ParamUserId = {
  userId: string;
};

export type UploadAvatarRequest = Request<ParamUserId>;
