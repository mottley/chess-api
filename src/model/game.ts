import { Chess, ChessInstance } from "chess.js";
import { Player } from "./player";
import { timeStamp } from "console";

export class Game {
  id: string
  chess: ChessInstance
  white: Player
  black: Player

  constructor(id: string, board: string, white: Player, black: Player,) {
    this.id = id
    this.white = white
    this.black = black
    this.chess = new Chess(board)
  }

  makeMove(move: string) {
    this.chess.move(move)
    // this.chess.game_over()

    // Flip turn
  }

  isMoveLegal(move: string): boolean {
    return this.chess.moves().includes(move)
  }

  rep(): string {
    return this.chess.fen()
  }

  static emptyBoard(): string {
    return new Chess().fen()
  }
}