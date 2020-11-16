import { InvalidMoveError, UnauthorizedMoveError } from '../error';
import { GameDao } from '../dao/game.dao';
import { Game } from '../model/game';
import { Player } from '../model/player';
import { Color, GameStatus } from '../model/enum';
import { MoveDao } from '../dao/move.dao';
import crypto from 'crypto';

export class GameService {

  constructor(private dao: GameDao, private mdao: MoveDao) { }

  async startGame(players: Player[]): Promise<string> {

    const shuffledPlayers: Player[] = players
      .map(p => ({ chance: crypto.randomInt(100), value: p }))
      .sort((a, b) => a.chance - b.chance)
      .map(s => s.value)

    const whitePlayer: Player = shuffledPlayers[0]
    const blackPlayer: Player = shuffledPlayers[1]

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

    // Check if game is still `in progress`
    if (game.status !== GameStatus.InProgress) {
      throw new UnauthorizedMoveError(`Game: ${gameId} is not currently in progress!`)
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
