import { Game } from '../model/game';
import { GameDbo } from './dbo/game.dbo';
import { Player } from '../model/player';


export class GameDao {

  getGame(id: string): Promise<Game | undefined> {
    return GameDbo.findByPk(id)
      .then(g => {
        if (g === null) {
          return undefined
        }

        return GameDao.convert(g)
      })
  }

  storeGame(game: Game) {
    // Update game representation in database with timestamp of last update
    // Current game state (Pending, In Progress, Completed)
    // End reason - draw, checkmate, etc.
    // Winner?
  }

  static convert(dbo: GameDbo): Game {
    const players: Player[] = dbo.players.map(p => p)

    const game: Game = new Game(players, dbo.id, dbo.board)
    return game
  }
}