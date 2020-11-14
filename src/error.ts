import { Request, Response, NextFunction } from 'express';

export interface ErrorData {
  message: string,
  name: string,
  statusCode: number
}

export enum HttpResponseCode {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500
}

export class HttpError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    Error.captureStackTrace(this, HttpError);
  }
}

export class HttpBadRequestError extends HttpError {
  constructor(message = 'Bad request') {
    super(message, HttpResponseCode.BadRequest);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(message, HttpResponseCode.Unauthorized);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden') {
    super(message, HttpResponseCode.Forbidden);
  }
}

export class InvalidMoveError extends HttpBadRequestError { }

export class UnauthorizedMoveError extends ForbiddenError { }

export class InvalidUsernameError extends HttpBadRequestError { }

export class InsecurePasswordError extends HttpBadRequestError { }

export class InvalidCredentialsError extends UnauthorizedError { }

export const handleErrors = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  next(err)
}