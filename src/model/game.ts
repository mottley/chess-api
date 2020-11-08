import { Chess, ChessInstance } from "chess.js";
import { Player } from "./player";

export class Game {
  id: string
  chess: ChessInstance
  players: Player[]

  constructor(players: Player[], id?: string, rep?: string) {
    this.players = players
    this.id = id || ''
    this.chess = rep ? new Chess() : new Chess(rep)
  }

  makeMove(move: string) {
    this.chess.move(move)
    // this.chess.game_over()
  }

  isMoveLegal(move: string): boolean {
    return this.chess.moves().includes(move)
  }

  rep(): string {
    return this.chess.fen()
  }
}