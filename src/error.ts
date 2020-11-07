
export interface ErrorData {
  message: string,
  name: string,
  statusCode: number
}

export enum HttpResponseCode {
  BadRequest = 400,
  NotFound = 404,
  Unauthorized = 403,
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
    super(message, HttpResponseCode.BadRequest);
  }
}

export class InvalidMoveError extends HttpBadRequestError { }

export class UnauthorizedMoveError extends UnauthorizedError { }

export class InvalidUsernameError extends HttpBadRequestError { }

export class InsecurePasswordError extends HttpBadRequestError { }