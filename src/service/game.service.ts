import { InvalidMoveError, UnauthorizedMoveError } from '../error';
import { GameDao } from '../dao/game.dao';
import { Game } from '../model/game';
import { Player } from '../model/player';
import { Color } from '../model/enum';
import { MoveDao } from '../dao/move.dao';

export class GameService {

  constructor(private dao: GameDao, private mdao: MoveDao) { }

  async startGame(players: Player[]): Promise<string> {

    // TODO - cleanup maybe
    let whitePlayer: Player;
    let blackPlayer: Player;

    const firstChance = Math.random() * 100;
    const secondChance = Math.random() * 100;

    if (firstChance > secondChance) {
      whitePlayer = players[0]
      blackPlayer = players[1]
    }
    else {
      whitePlayer = players[1]
      blackPlayer = players[0]
    }

    return this.dao.createGame(Game.emptyBoard(), whitePlayer, blackPlayer)
  }

  async makeMove(authenticatedPlayer: Player, gameId: string, move: string) {
    // Pull and initialize current game state
    const game: Game | undefined = await this.dao.getGame(gameId);

    // TODO - pull out logic into checkAuthorizedMove method
    const playerInGame: boolean = game !== undefined &&
      (game.white.id === authenticatedPlayer.id || game.black.id === authenticatedPlayer.id)

    if (game === undefined || !playerInGame) {
      throw new UnauthorizedMoveError(`Player not allowed to act on game: ${gameId}!`)
    }

    const playerLookup = {
      [Color.White]: game.white.id,
      [Color.Black]: game.black.id
    }

    const isPlayersTurn: boolean = playerLookup[game.turn] === authenticatedPlayer.id

    if (!isPlayersTurn) {
      throw new UnauthorizedMoveError('Not your turn!')
    }

    // Check if move is legal first
    if (!game.isMoveLegal(move)) {
      throw new InvalidMoveError(`Move: ${move} is not legal!`)
    }

    // Make move
    game.makeMove(move)

    // Record game state
    await this.dao.storeGame(game)

    // Record move history
    await this.mdao.storeMove(move, game, authenticatedPlayer)
  }
}
