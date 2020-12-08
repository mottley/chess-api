import { Request, Response, NextFunction } from 'express';
import { MoveRequest, MoveParams, moveRequestSchema, moveParamsSchema } from './model/request/move.request';
import Ajv from 'ajv';
import { roomParamsSchema, RoomRequest, RoomParams } from './model/request/room.request';
import { BadRequestError } from './error';
import { accountSchema, LoginRequest, RegisterRequest } from './model/request/login.request';
import { GameParams, gameSchema } from './model/request/game.request';

const ajv = new Ajv();

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

export const validateLoginOrRegistration = (req: Request<{}, {}, LoginRequest | RegisterRequest>, res: Response, next: NextFunction) => {
  const validateBody = ajv.compile(accountSchema);

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

export const validateGetGame = (req: Request<GameParams, {}, {}>, res: Response, next: NextFunction) => {
  const validateParams = ajv.compile(gameSchema)

  if (!validateParams(req.params)) {
    return next(new BadRequestError(`Failed param validation: ${validateParams.errors}`))
  }

  return next()
}