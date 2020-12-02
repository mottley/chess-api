import { JSONSchemaType } from 'ajv';

export interface MoveParams {
  gameId: string
}

export interface MoveRequest {
  move: string,
}

export const moveParamsSchema: JSONSchemaType<MoveParams> = {
  type: 'object',
  properties: {
    gameId: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    },
  },
  required: ['gameId'],
  additionalProperties: false
}

export const moveRequestSchema: JSONSchemaType<MoveRequest> = {
  type: 'object',
  properties: {
    move: {
      type: 'string',
      pattern: '^[A-Za-z]{1,3}[0-9](\\+|#)?$' // TODO - re-evaluate regex here
    },
  },
  required: ['move'],
  additionalProperties: false
}