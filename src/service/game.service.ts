import { InvalidMoveError, UnauthorizedMoveError, DuplicatePlayerError } from '../error';
import { GameDao } from '../dao/game.dao';
import { Game } from '../model/game';
import { Player } from '../model/player';
import { Color, GameStatus, RoomStatus } from '../model/enum';
import { MoveDao } from '../dao/move.dao';
import crypto from 'crypto';
import { GameResponse } from '../model/response/game.response';
import { RoomDao } from '../dao/room.dao';
import { Move } from '../model/move';
import { Room } from '../model/room';
import { logger } from '../logger';

const log = logger('GameService')

export class GameService {

  private TURN_TIMER = 300;

  constructor(private dao: GameDao, private mdao: MoveDao, private rdao: RoomDao) { }

  async startGame(players: Player[]): Promise<GameResponse> {

    // Check that both players are not the same
    if (players[0].id === players[1].id) {
      throw new DuplicatePlayerError('Must be different players to start a game!')
    }

    const shuffledPlayers: Player[] = players
      .map(p => ({ chance: crypto.randomInt(100), value: p }))
      .sort((a, b) => a.chance - b.chance)
      .map(s => s.value)

    const whitePlayer: Player = shuffledPlayers[0]
    const blackPlayer: Player = shuffledPlayers[1]

    const game: Game = await this.dao.createGame(Game.emptyBoard(), whitePlayer, blackPlayer)

    return this.createResponse(game, [])
  }

  async getGame(authenticatedPlayer: Player, gameId: string): Promise<GameResponse> {
    const game: Game | undefined = await this.dao.getGame(gameId);

    const playerInGame: boolean = game !== undefined &&
      (game.white.id === authenticatedPlayer.id || game.black.id === authenticatedPlayer.id)

    if (game === undefined || !playerInGame) {
      log.info(`Player: ${authenticatedPlayer.username} was blocked attempting to view game: ${gameId}`)
      throw new UnauthorizedMoveError(`Player not allowed to view game: ${gameId}!`)
    }

    const moves: Move[] = await this.mdao.getMovesByGameId(game.id)

    return this.createResponse(game, moves)
  }

  async makeMove(authenticatedPlayer: Player, gameId: string, move: string): Promise<GameResponse> {
    // Pull and initialize current game state
    const game: Game | undefined = await this.dao.getGame(gameId);

    const playerInGame: boolean = game !== undefined &&
      (game.white.id === authenticatedPlayer.id || game.black.id === authenticatedPlayer.id)

    if (game === undefined || !playerInGame) {
      log.info(
        `Player: ${authenticatedPlayer.username} was blocked attempting to make a move on game: ${gameId}, Reason: player not in game`
      )
      throw new UnauthorizedMoveError(`Player not allowed to act on game: ${gameId}!`)
    }

    // Check if game is still `in progress`
    if (game.status !== GameStatus.InProgress && game.status !== GameStatus.Check) {
      log.info(
        `Player: ${authenticatedPlayer.username} was blocked attempting to make a move on game: ${gameId}, Reason: game not in progress`
      )
      throw new UnauthorizedMoveError(`Game: ${gameId} is not currently in progress!`)
    }

    const playerLookup = {
      [Color.White]: game.white.id,
      [Color.Black]: game.black.id
    }

    const isPlayersTurn: boolean = playerLookup[game.turn] === authenticatedPlayer.id

    if (!isPlayersTurn) {
      log.info(
        `Player: ${authenticatedPlayer.username} was blocked attempting to make a move on game: ${gameId}, Reason: not player's turn`
      )
      throw new UnauthorizedMoveError('Not your turn!')
    }

    const endOfTurn: Date = this.calculateEndOfTurn(game.lastUpdate)
    const currentTime: Date = new Date();
    if (endOfTurn < currentTime) {
      log.info(
        `Player: ${authenticatedPlayer.username} was blocked attempting to make a move on game: ${gameId}, Reason: game is expired`
      )
      throw new UnauthorizedMoveError('Game is expired!')
    }

    // Check if move is legal first
    if (!game.isMoveLegal(move)) {
      log.info(
        `Player: ${authenticatedPlayer.username} was blocked attempting to make a move on game: ${gameId}, Reason: move is not legal`
      )
      throw new InvalidMoveError(`Move: ${move} is not legal!`)
    }

    // Make move
    game.makeMove(move)

    // Record game state
    const updatedGame: Game = await this.dao.storeGame(game)

    // Record move history
    await this.mdao.storeMove(move, game, authenticatedPlayer)
    const moves: Move[] = await this.mdao.getMovesByGameId(updatedGame.id)

    if (updatedGame.isGameOver()) {
      const room: Room = (await this.rdao.getRoomsForGames([updatedGame.id]))[0]
      room.status = RoomStatus.Closed
      await this.rdao.storeRoom(room)
    }

    return this.createResponse(updatedGame, moves)
  }

  async forfeitExpiredGames(): Promise<void> {
    const activeGames: Game[] = await this.dao.getGamesByStatus([GameStatus.InProgress, GameStatus.Check])

    const gamesWithEndOfTurn = activeGames.map(g => ({
      game: g,
      end: this.calculateEndOfTurn(g.lastUpdate)
    }))

    const currentTime = new Date();

    const expiredGames: Game[] = gamesWithEndOfTurn
      .filter(ge => ge.end < currentTime)
      .map(ge => ge.game)

    // Expire games and store
    expiredGames.forEach(g => g.expireGame())
    expiredGames.forEach(async g => await this.dao.storeGame(g))

    // Close rooms
    const gameIds: string[] = expiredGames.map(g => g.id)
    const rooms: Room[] = await this.rdao.getRoomsForGames(gameIds)
    rooms.forEach(r => r.status = RoomStatus.Closed)
    rooms.forEach(async r => await this.rdao.storeRoom(r))
  }

  private createResponse(game: Game, moves: Move[]): GameResponse {
    const playerColorLookup = {
      [game.white.id]: Color.White,
      [game.black.id]: Color.Black
    }

    return {
      gameId: game.id,
      status: game.status,
      turn: game.turn,
      board: game.board(),
      players: {
        white: game.white.username,
        black: game.black.username
      },
      moveTimer: this.calculateEndOfTurn(game.lastUpdate),
      moves: moves.map(m => ({
        move: m.move,
        username: m.player.username,
        color: playerColorLookup[m.player.id],
        time: m.timestamp
      }))
    }
  }

  private calculateEndOfTurn(lastMove: Date): Date {
    const endOfTurn: Date = new Date(lastMove.getTime())
    endOfTurn.setSeconds(endOfTurn.getSeconds() + this.TURN_TIMER)
    return endOfTurn
  }
}
