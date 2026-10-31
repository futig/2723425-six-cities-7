import { inject, injectable } from 'inversify';
import { NextFunction, Request, Response } from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { ExceptionFilter } from './exception-filter.interface.js';
import { HttpError } from '../errors/index.js';
import { Logger } from '../../logger/index.js';
import { Component } from '../../../types/index.js';
import { createErrorObject } from '../../../helpers/index.js';

// Ошибки, которые бросают middleware Express (например, express.json() при невалидном JSON),
// содержат код ответа в поле status и флаг expose для ошибок клиента.
type ExpressClientError = Error & { status: number; expose: true };

function isExpressClientError(error: Error): error is ExpressClientError {
  return 'status' in error && typeof error.status === 'number' && 'expose' in error && error.expose === true;
}

@injectable()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger
  ) {
    this.logger.info('Register AppExceptionFilter');
  }

  private handleHttpError(error: HttpError, res: Response): void {
    this.logger.error(`[${error.detail ?? 'HttpError'}]: ${error.httpStatusCode} — ${error.message}`, error);
    res
      .status(error.httpStatusCode)
      .json(createErrorObject(error.message));
  }

  private handleExpressClientError(error: ExpressClientError, res: Response): void {
    this.logger.error(`[Express]: ${error.status} — ${error.message}`, error);
    res
      .status(error.status)
      .json(createErrorObject(error.message));
  }

  private handleOtherError(error: Error, res: Response): void {
    this.logger.error(error.message, error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(createErrorObject(getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)));
  }

  public catch(error: Error, _req: Request, res: Response, _next: NextFunction): void {
    if (error instanceof HttpError) {
      return this.handleHttpError(error, res);
    }

    if (isExpressClientError(error)) {
      return this.handleExpressClientError(error, res);
    }

    this.handleOtherError(error, res);
  }
}
