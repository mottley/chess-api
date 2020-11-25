import { Request, Response, NextFunction } from 'express';
import { MoveRequest, MoveParams, moveRequestSchema, moveParamsSchema } from './service/request/move.request';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { roomParamsSchema, RoomRequest, RoomParams } from './service/request/room.request';
import { BadRequestError } from './error';

const ajv = new Ajv();
addFormats(ajv);

export const validateMove = (req: Request<MoveParams, {}, MoveRequest>, res: Response, next: NextFunction) => {
  const validateParams = ajv.compile(moveParamsSchema);
  const validateBody = ajv.compile(moveRequestSchema);

  if (!validateParams(req.params)) {
    return next(new BadRequestError(`Failed param validation: ${validateParams.errors}`))
  }

  if (!validateBody(req.body)) {
    return next(new BadRequestError(`Failed body validation: ${validateBody.errors}`))
  }

  return next()
}

export const validateCreateRoom = (req: Request<{}, {}, RoomRequest>, res: Response, next: NextFunction) => {
  const validateBody = ajv.compile(roomParamsSchema)

  if (!validateBody(req.body)) {
    return next(new BadRequestError(`Failed param validation: ${validateBody.errors}`))
  }

  return next()
}

export const validateJoinRoom = (req: Request<RoomParams, {}, {}>, res: Response, next: NextFunction) => {
  const validateParams = ajv.compile(roomParamsSchema)

  if (!validateParams(req.params)) {
    return next(new BadRequestError(`Failed param validation: ${validateParams.errors}`))
  }

  return next()
}