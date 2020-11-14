import { Chess, ChessInstance } from 'chess.js';
import { InvalidMoveError, UnauthorizedMoveError } from '../error';
import { GameDao } from '../dao/game.dao';
import { Game } from '../model/game';
import { Player } from '../model/player';

export class GameService {

  constructor(private dao: GameDao) { }

  // TODO - do we need to distinguish who is white vs. black?
  startGame(players: Player[]) {
    // Initialize new game
    const game: Game = new Game([]);

    // Generate string representation and store in database
    this.dao.storeGame(game);
  }

  async makeMove(authenticatedPlayer: Player, gameId: string, move: string) {
    // Pull and initialize current game state
    const game: Game | undefined = await this.dao.getGame(gameId);
    const player: Player | undefined = game !== undefined ?
      game.players.find(p => p.id === authenticatedPlayer.id) : undefined

    if (game === undefined || player === undefined) {
      throw new UnauthorizedMoveError(`Player not allowed to act on game: ${gameId}!`)
    }

    // TODO - Check if player is allowed to make move/is their turn

    // Check if move is legal first
    if (!game.isMoveLegal(move)) {
      throw new InvalidMoveError(`Move: ${move} is not legal!`)
    }

    // Make move
    game.makeMove(move)

    // Record game state
    this.dao.storeGame(game)

    // Record move history
  }

  // TODO - pass in player
  getMoveHistory(gameId: string) {
    return
  }
}

// new GameService(new GameDao()).makeMove('', '')