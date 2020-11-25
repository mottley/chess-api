import { JSONSchemaType } from 'ajv';

export interface GameParams {
  gameId: string
}

export const gameSchema: JSONSchemaType<GameParams> = {
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