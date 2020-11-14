import { Chess, ChessInstance } from 'chess.js';
import { Player } from './player';
import { Color } from './enum';

export class Game {
  id: string
  chess: ChessInstance
  white: Player
  black: Player
  turn: Color

  constructor(id: string, board: string, white: Player, black: Player, turn: Color) {
    this.id = id
    this.white = white
    this.black = black
    this.chess = new Chess(board)
    this.turn = turn
  }

  makeMove(move: string) {
    this.chess.move(move)
    // TODO - check/handle game over

    const reverseTurnLookup = {
      [Color.White]: Color.Black,
      [Color.Black]: Color.White
    }
    this.turn = reverseTurnLookup[this.turn]
  }

  isMoveLegal(move: string): boolean {
    return this.chess.moves().includes(move)
  }

  board(): string {
    return this.chess.fen()
  }

  static emptyBoard(): string {
    return new Chess().fen()
  }
}