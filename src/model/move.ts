import { Game } from './game';
import { Player } from './player';


export class Move {
  move: string
  game: Game
  player: Player
  timestamp: Date

  constructor(move: string, game: Game, player: Player, timestamp: Date) {
    this.move = move
    this.game = game
    this.player = player
    this.timestamp = timestamp
  }
}