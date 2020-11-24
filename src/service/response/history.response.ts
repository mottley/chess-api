import { GamePlayersResponse } from './game.response';
import { MoveResponse } from './move.response';

export interface HistoryResponse {
  gameId: string,
  winner?: string,
  result: string,
  players: GamePlayersResponse,
  finalBoard: string,
  moves: MoveResponse[]
}