import { Color, GameStatus } from '../../model/enum';
import { MoveResponse } from './move.response';


export interface GamePlayersResponse {
  white: string
  black: string
}

export interface GameResponse {
  gameId: string
  status: GameStatus
  turn: Color
  board: string
  players: GamePlayersResponse
  moveTimer: Date
  moves: MoveResponse[]
}