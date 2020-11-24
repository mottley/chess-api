import { MoveDbo } from './dbo/move.dbo';
import { Move } from '../model/move';
import { Game } from '../model/game';
import { Player } from '../model/player';
import { PlayerDao } from './player.dao';
import { Op } from 'sequelize';


export class MoveDao {
  constructor() {
    MoveDbo.sync({ force: false })
  }

  async storeMove(move: string, game: Game, player: Player) {
    await MoveDbo.create({
      move: move,
      gameId: game.id,
      playerId: player.id
    })
  }

  async getMovesByGameId(gameId: string): Promise<Move[]> {
    const moves: MoveDbo[] = await MoveDbo.findAll({
      where: { gameId: gameId },
      include: ['game', 'player']
    })

    return moves.map(m => MoveDao.convert(m))
  }

  async getMovesForGameIds(gameIds: string[]): Promise<Move[]> {
    const moves: MoveDbo[] = await MoveDbo.findAll({
      where: { gameId: { [Op.in]: gameIds } },
      include: ['game', 'player']
    })

    return moves.map(m => MoveDao.convert(m))
  }

  static convert(dbo: MoveDbo) {
    const player: Player = PlayerDao.convert(dbo.player)
    return new Move(dbo.move, dbo.game.id, player, dbo.createdAt)
  }
}