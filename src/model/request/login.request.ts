import { JSONSchemaType } from 'ajv';

export interface LoginRequest {
  username: string,
  password: string
}

export interface RegisterRequest {
  username: string,
  password: string
}

export const accountSchema: JSONSchemaType<LoginRequest | RegisterRequest> = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      pattern: '^[A-Za-z0-9]+$',
      minLength: 5,
      maxLength: 15
    },
    password: {
      type: 'string',
      pattern: '^[A-Za-z0-9!.]+$',
      minLength: 6,
      maxLength: 25
    }
  },
  required: ['username', 'password'],
  additionalProperties: false
}
