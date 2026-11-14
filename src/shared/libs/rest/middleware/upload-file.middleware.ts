import { NextFunction, Request, RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { extension } from 'mime-types';
import multer, { diskStorage } from 'multer';
import { nanoid } from 'nanoid';
import { HttpError } from '../errors/index.js';
import { Middleware } from './middleware.interface.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];

export class UploadFileMiddleware implements Middleware {
  private readonly uploadSingleFile: RequestHandler;

  constructor(uploadDirectory: string, fieldName: string) {
    const storage = diskStorage({
      destination: (_req, _file, callback) => callback(null, uploadDirectory),
      filename: (_req, file, callback) => {
        const fileExtension = extension(file.mimetype);

        if (!fileExtension) {
          return callback(
            new HttpError(
              StatusCodes.BAD_REQUEST,
              'Unable to determine the image extension.',
              'UploadFileMiddleware',
            ),
            '',
          );
        }

        callback(null, `${nanoid()}.${fileExtension}`);
      },
    });

    this.uploadSingleFile = multer({
      storage,
      fileFilter: (_req, file, callback) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return callback(null, true);
        }

        callback(new HttpError(
          StatusCodes.BAD_REQUEST,
          'Only JPG and PNG images are allowed.',
          'UploadFileMiddleware',
        ));
      },
    }).single(fieldName);
  }

  public execute(req: Request, res: Response, next: NextFunction): void {
    this.uploadSingleFile(req, res, next);
  }
}
