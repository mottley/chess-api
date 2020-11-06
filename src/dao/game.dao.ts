import { Game } from '../model/game';


export class GameDao {

  getGame(id: string): Game | undefined {
    return
  }

  storeGame(game: Game) {
    // Update game representation in database with timestamp of last update
    // Current game state (Pending, In Progress, Completed)
    // End reason - draw, checkmate, etc.
    // Winner?
  }
}