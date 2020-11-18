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

export class NotFoundError extends HttpError {
  constructor(message = 'Not found') {
    super(message, HttpResponseCode.NotFound);
  }
}

export class BadRequestError extends HttpError {
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

export class InvalidMoveError extends BadRequestError { }

export class UnauthorizedMoveError extends ForbiddenError { }

export class InvalidUsernameError extends BadRequestError { }

export class InsecurePasswordError extends BadRequestError { }

export class InvalidCredentialsError extends UnauthorizedError { }

export class RoomNotFoundError extends NotFoundError { }

export class DuplicatePlayerError extends BadRequestError { }

export const handleErrors = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  // TODO - handle errors not http errors so that stack trace isn't returned
  next(err)
}