import { Player } from './player';


export class Move {
  move: string
  player: Player
  timestamp: Date
  gameId: string

  constructor(move: string, gameId: string, player: Player, timestamp: Date) {
    this.move = move
    this.gameId = gameId
    this.player = player
    this.timestamp = timestamp
  }
}