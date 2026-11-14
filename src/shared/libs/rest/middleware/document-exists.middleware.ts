import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { DocumentExists } from '../../../types/index.js';
import { HttpError } from '../errors/index.js';
import { Middleware } from './middleware.interface.js';

type DocumentLocation = 'params' | 'body' | 'query';

export class DocumentExistsMiddleware implements Middleware {
  constructor(
    private readonly service: DocumentExists,
    private readonly entityName: string,
    private readonly paramName: string,
    private readonly location: DocumentLocation = 'params',
    private readonly statusCode: number = StatusCodes.NOT_FOUND,
  ) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const source = req[this.location] as Record<string, unknown>;
    const documentId = source[this.paramName];

    if (typeof documentId !== 'string' || !await this.service.exists(documentId)) {
      throw new HttpError(
        this.statusCode,
        `${this.entityName} with id ${String(documentId)} not found.`,
        'DocumentExistsMiddleware',
      );
    }

    next();
  }
}
