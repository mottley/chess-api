import { PlayerResponse } from './player.response';


export interface RoomResponse {
  id: string
  name: string
  gameId?: string
  players: PlayerResponse[]
}