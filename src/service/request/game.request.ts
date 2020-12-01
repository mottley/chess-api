import { JSONSchemaType } from 'ajv';

export interface GameParams {
  gameId: string
}

export const gameSchema: JSONSchemaType<GameParams> = {
  type: 'object',
  properties: {
    gameId: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
    },
  },
  required: ['gameId'],
  additionalProperties: false
}