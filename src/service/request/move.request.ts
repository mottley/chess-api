import { JSONSchemaType } from 'ajv';

export interface MoveParams {
  gameId: string
}

export interface MoveRequest {
  username: string, // TODO - temporary
  move: string,
}

export const moveParamsSchema: JSONSchemaType<MoveParams> = {
  type: 'object',
  properties: {
    gameId: {
      type: 'string',
      format: 'uuid'
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
      pattern: '^[A-Za-z]{1,3}[0-9]$'
    },
    username: {
      type: 'string'
    }
  },
  required: ['move'],
  additionalProperties: false
}