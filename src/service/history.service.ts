import { GameDao } from '../dao/game.dao';
import { MoveDao } from '../dao/move.dao';
import { Move } from '../model/move';
import { Game } from '../model/game';
import { UnauthorizedError } from '../error';
import { Player } from '../model/player';
import { GameStatus, GameRecord, GameResult } from '../model/enum';
import { PlayerDao } from '../dao/player.dao';
import { Record } from '../model/record';

interface PlayerRecordMapping {
  [key: string]: Record
}

export class HistoryService {

  constructor(private gdao: GameDao, private mdao: MoveDao, private pdao: PlayerDao) { }

  async getGameMoves(authenticatedPlayer: Player, gameId: string): Promise<Move[]> {
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

  async getPlayerRecords() {
    const allPlayers: Player[] = await this.pdao.getAllPlayers()
    const completedGames: Game[] = await this.gdao.getGamesByStatus([GameStatus.Completed])

    const playerRecordMapping = allPlayers.reduce((map, p) => {
      map[p.id] = new Record()
      return map
    }, {} as PlayerRecordMapping)

    for (let game of completedGames) {
      if (game.result === GameResult.Checkmate) {
        playerRecordMapping[game.winner!.id].wins++

        // Determine loser
        const playerIds = new Set([game.white.id, game.black.id])
        playerIds.delete(game.winner!.id)
        const loserId: string = playerIds.values().next().value;
        playerRecordMapping[loserId].losses++
      }
      else {
        playerRecordMapping[game.white.id].draws++
        playerRecordMapping[game.black.id].draws++
      }
    }

    console.log(playerRecordMapping)
  }
}