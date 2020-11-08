import { Request, Response, NextFunction } from 'express';
import { MoveRequest, MoveParams, moveRequestSchema, moveParamsSchema } from './service/request/move.request';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv();
addFormats(ajv);

export const validateMove = (req: Request<MoveParams, {}, MoveRequest>, res: Response, next: NextFunction) => {
  const validateParams = ajv.compile(moveParamsSchema);
  const validateBody = ajv.compile(moveRequestSchema);

  if (!validateParams(req.params)) {
    console.log(validateParams.errors)
    return next(new Error(`Failed param validation: ${validateParams.errors}`))
  }

  if (!validateBody(req.body)) {
    console.log(validateBody.errors)
    return next(new Error(`Failed body validation: ${validateBody.errors}`))
  }

  return next()
}