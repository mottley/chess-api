import { Chess, ChessInstance } from "chess.js";
import { v4 as uuidv4 } from 'uuid';
import { Player } from "./player";

export class Game {
  id: string
  chess: ChessInstance
  players: Player[]

  constructor(players: Player[], id?: string, rep?: string) {
    this.players = players
    this.id = id || uuidv4()
    this.chess = rep ? new Chess() : new Chess(rep)
  }

  isMoveLegal(move: string): boolean {
    return this.chess.moves().includes(move)
  }

  rep(): string {
    return this.chess.fen()
  }
}