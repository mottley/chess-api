import { GameDao } from '../dao/game.dao';
import { MoveDao } from '../dao/move.dao';
import { Move } from '../model/move';
import { Game } from '../model/game';
import { UnauthorizedError } from '../error';
import { Player } from '../model/player';
import { GameStatus } from '../model/enum';


export class HistoryService {

  constructor(private gdao: GameDao, private mdao: MoveDao) { }

  async getGameMoves(authenticatedPlayer: Player, gameId: string) {
    const game: Game | undefined = await this.gdao.getGame(gameId)

    // If in progress - only players in game can view, if completed - everyone can view
    const allowedToView: boolean = game !== undefined && (game.status === GameStatus.Completed
      || (game.status === GameStatus.InProgress && (game.white.id === authenticatedPlayer.id || game.black.id === authenticatedPlayer.id)))

    if (!allowedToView) {
      throw new UnauthorizedError(`Not authorized to view moves for game: ${gameId}`)
    }

    const moves: Move[] = await this.mdao.getMovesByGameId(gameId)

    // TODO - implement response object(s)
    return moves
  }
}