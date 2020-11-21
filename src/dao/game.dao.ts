import { Game } from '../model/game';
import { GameDbo } from './dbo/game.dbo';
import { Player } from '../model/player';
import { GameStatus, Color } from '../model/enum';
import { PlayerDao } from './player.dao';
import { Op } from 'sequelize';



export class GameDao {

  constructor() {
    GameDbo.sync({ force: false })
  }

  async createGame(board: string, white: Player, black: Player): Promise<Game> {
    const initialGame: GameDbo = await GameDbo.create({
      status: GameStatus.InProgress,
      board: board,
      whitePlayerId: white.id,
      blackPlayerId: black.id,
      turn: Color.White
    })

    const game: Game = (await this.getGame(initialGame.id))!
    return game
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

  async getGamesByStatus(statuses: GameStatus[]): Promise<Game[]> {
    const games: GameDbo[] = await GameDbo.findAll({
      where: { status: { [Op.in]: statuses } },
      include: { all: true }
    })
    return games.map(g => GameDao.convert(g))
  }

  static convert(dbo: GameDbo): Game {
    const whitePlayer: Player = PlayerDao.convert(dbo.white)
    const blackPlayer: Player = PlayerDao.convert(dbo.black)
    const winner: Player | undefined = dbo.winner ? PlayerDao.convert(dbo.winner) : undefined
    return new Game(dbo.id, dbo.board, whitePlayer, blackPlayer,
      dbo.turn, dbo.status, dbo.updatedAt, winner, dbo.result)
  }
}
