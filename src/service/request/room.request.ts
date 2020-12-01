import { JSONSchemaType } from 'ajv';


export interface RoomParams {
  roomName: string
}

export interface RoomRequest {
  roomName: string
}

export const roomParamsSchema: JSONSchemaType<RoomParams | RoomRequest> = {
  type: 'object',
  properties: {
    roomName: {
      type: 'string',
      pattern: '^[A-Za-z0-9 ]+$',
      minLength: 5,
      maxLength: 15
    },
  },
  required: ['roomName'],
  additionalProperties: false
}
