import { Chess, ChessInstance } from 'chess.js';
import { InvalidMoveError } from '../error';
import { GameDao } from '../dao/game.dao';
import { Game } from '../model/game';

export class GameService {

  constructor(private dao: GameDao) {
  }

  // TODO - pass in players
  startGame() {
    // Initialize new game
    const game: Game = new Game([]);

    // Generate string representation and store in database
    this.dao.storeGame(game);
  }

  // TODO - pass in player
  makeMove(gameId: string, move: string) {
    // Pull and initialize current game state
    const game: Game = this.dao.getGame(gameId);

    if (game === undefined) {
      // throw new InvalidGameError(`Game id: ${gameId} is not found!`)
      return
    }

    // Check if move is legal first
    if (!game.isMoveLegal(move)) {
      throw new InvalidMoveError(`${move} is not legal!`)
    }

    // Make move
    // Record game state
    // Record move history
  }

  // TODO - pass in player
  getMoveHistory(gameId: string) {
    return
  }
}
