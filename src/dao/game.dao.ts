import { Game } from '../model/game';
import { GameDbo } from './dbo/game.dbo';
import { Player } from '../model/player';
import { GameStatus, Color } from '../model/enum';
import { PlayerDao } from './player.dao';



export class GameDao {

  constructor() {
    GameDbo.sync({ force: false })
  }

  async createGame(board: string, white: Player, black: Player): Promise<string> {

    const game: GameDbo = await GameDbo.create({
      status: GameStatus.InProgress,
      board: board,
      whitePlayerId: white.id,
      blackPlayerId: black.id,
      turn: Color.White
    })

    // TODO - pack into model
    return game.id
  }

  async getGame(id: string): Promise<Game | undefined> {
    const game: GameDbo | null = await GameDbo.findByPk(id, { include: ['white', 'black'] })

    if (game === null) {
      return undefined
    }

    return GameDao.convert(game)
  }

  async storeGame(game: Game) {
    await GameDbo.update({
      board: game.board(),
      turn: game.turn,
      status: game.status,
      result: game.result,
      winnerId: game.winner ? game.winner.id : undefined
    }, { where: { id: game.id } })
  }

  async getGamesByStatus(status: GameStatus): Promise<Game[]> {
    const games: GameDbo[] = await GameDbo.findAll({ where: { status: status }, include: { all: true } })
    return games.map(g => GameDao.convert(g))
  }

  static convert(dbo: GameDbo): Game {
    const whitePlayer: Player = PlayerDao.convert(dbo.white)
    const blackPlayer: Player = PlayerDao.convert(dbo.black)
    const winner: Player = PlayerDao.convert(dbo.winner)
    return new Game(dbo.id, dbo.board, whitePlayer, blackPlayer, dbo.turn, dbo.status, winner, dbo.result)
  }
}
