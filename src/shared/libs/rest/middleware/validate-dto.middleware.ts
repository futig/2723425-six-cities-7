import { NextFunction, Request, Response } from 'express';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import { Middleware } from './middleware.interface.js';

type ValidationSource = 'body' | 'query';

type ValidationErrorDetail = {
  property: string;
  messages: string[];
};

function formatErrors(errors: ValidationError[], parentProperty = ''): ValidationErrorDetail[] {
  return errors.flatMap((error) => {
    const property = parentProperty ? `${parentProperty}.${error.property}` : error.property;
    const currentErrors = error.constraints
      ? [{ property, messages: Object.values(error.constraints) }]
      : [];

    return [...currentErrors, ...formatErrors(error.children ?? [], property)];
  });
}

export class ValidateDtoMiddleware implements Middleware {
  constructor(
    private readonly dto: ClassConstructor<object>,
    private readonly source: ValidationSource = 'body',
  ) {}

  public async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    const sourceData = req[this.source];

    if (this.source === 'body' && (
      typeof sourceData !== 'object' ||
      sourceData === null ||
      Array.isArray(sourceData) ||
      Object.keys(sourceData).length === 0
    )) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Validation error',
        details: [{ property: 'body', messages: ['Request body must be a non-empty object.'] }],
      });
      return;
    }

    const dtoInstance = plainToInstance(this.dto, sourceData ?? {});
    const errors = await validate(dtoInstance, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    });

    if (errors.length > 0) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Validation error',
        details: formatErrors(errors),
      });
      return;
    }

    if (this.source === 'body') {
      req.body = dtoInstance;
    }

    next();
  }
}
