import { MoveDbo } from './dbo/move.dbo';
import { Move } from '../model/move';
import { Game } from '../model/game';
import { Player } from '../model/player';


export class MoveDao {
  constructor() {
    MoveDbo.sync()
  }

  async storeMove(move: string, game: Game, player: Player) {
    await MoveDbo.create({
      move: move,
      gameId: game.id,
      playerId: player.id
    })
  }
}