import { Game } from '../model/game';
import { GameDbo } from './dbo/game.dbo';
import { Player } from '../model/player';
import { GameStatus } from '../model/enum';
import { PlayerDbo } from './dbo/player.dbo';
import { PlayerDao } from './player.dao';


export class GameDao {

  constructor() {
    GameDbo.sync()
  }

  async createGame(board: string, players: PlayerDbo[]): Promise<void> {
    const game: GameDbo = await GameDbo.create({
      status: GameStatus.InProgress,
      board: board,
    })

    players.forEach(p => game.addPlayer(p))
  }

  async getGame(id: string): Promise<Game | undefined> {
    const game: GameDbo | null = await GameDbo.findByPk(id)

    if (game === null) {
      return undefined
    }

    const players: PlayerDbo[] | null = await game.getPlayers()

    return GameDao.convert(game, players)
  }

  storeGame(game: Game) {
    // Update game representation in database with timestamp of last update
    // Current game state (Pending, In Progress, Completed)
    // End reason - draw, checkmate, etc.
    // Winner?

    GameDbo.update({
      board: game.rep()
    },
      { where: { id: game.id } }
    )
  }

  static convert(dbo: GameDbo, pdbos: PlayerDbo[]): Game {
    const players: Player[] = pdbos.map(p => PlayerDao.convert(p))
    return new Game(players, dbo.id, dbo.board)
  }
}
