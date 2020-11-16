import { Chess, ChessInstance } from 'chess.js';
import { Player } from './player';
import { Color, GameStatus, GameResult } from './enum';

export class Game {
  id: string
  chess: ChessInstance
  white: Player
  black: Player
  turn: Color
  status: GameStatus
  winner?: Player
  result?: GameResult

  constructor(id: string, board: string, white: Player, black: Player,
    turn: Color, status: GameStatus, winner?: Player, result?: GameResult) {
    this.id = id
    this.white = white
    this.black = black
    this.chess = new Chess(board)
    this.turn = turn
    this.status = status
    this.winner = winner
    this.result = result
  }

  makeMove(move: string) {
    this.chess.move(move)

    this.status = this.determineStatus()
    this.result = this.determineResult()
    this.winner = this.determineWinner()

    this.turn = this.determineTurn()
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

  private determineStatus(): GameStatus {
    switch (true) {
      case this.chess.game_over():
        return GameStatus.Completed
      case this.chess.in_check():
        return GameStatus.Check
      default:
        return GameStatus.InProgress
    }
  }

  private determineResult(): GameResult | undefined {
    switch (true) {
      case this.chess.in_checkmate():
        return GameResult.Checkmate
      case this.chess.in_draw():
        return GameResult.Draw
      case this.chess.in_stalemate():
        return GameResult.Stalemate
      case this.chess.in_threefold_repetition():
        return GameResult.ThreefoldRepetition
      case this.chess.insufficient_material():
        return GameResult.InsufficientMaterial
      default:
        return undefined
    }
  }

  private determineWinner(): Player | undefined {
    const winnerExists = this.chess.in_checkmate()
    if (!winnerExists) {
      return
    }

    const playerLookup = {
      [Color.White]: this.white,
      [Color.Black]: this.black
    }

    return playerLookup[this.turn]
  }

  private determineTurn(): Color {
    const reverseTurnLookup = {
      [Color.White]: Color.Black,
      [Color.Black]: Color.White
    }
    return reverseTurnLookup[this.turn]
  }
}