import { GameDao } from '../dao/game.dao';
import { MoveDao } from '../dao/move.dao';
import { Move } from '../model/move';
import { Game } from '../model/game';
import { Player } from '../model/player';
import { GameStatus, GameResult, Color } from '../model/enum';
import { PlayerDao } from '../dao/player.dao';
import { Record } from '../model/record';
import { HistoryResponse } from '../model/response/history.response';
import { LeaderboardResponse } from '../model/response/leaderboard.response';

interface PlayerRecordMapping {
  [key: string]: Record
}

interface GameMoveListMapping {
  [gameId: string]: Move[]
}

export class HistoryService {

  constructor(private gdao: GameDao, private mdao: MoveDao, private pdao: PlayerDao) { }

  async getLeaderboard(): Promise<LeaderboardResponse[]> {
    const allPlayers: Player[] = await this.pdao.getAllPlayers()
    const completedGames: Game[] = await this.gdao.getGamesByStatus([GameStatus.Completed])

    const playerRecordMapping = allPlayers.reduce((map, p) => {
      map[p.id] = new Record()
      return map
    }, {} as PlayerRecordMapping)

    for (let game of completedGames) {
      if (game.result === GameResult.Checkmate || game.result === GameResult.Forfeit) {
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

    return this.createLeaderboardResponse(allPlayers, playerRecordMapping)
  }

  async getGameHistory(): Promise<HistoryResponse[]> {
    const completedGames: Game[] = await this.gdao.getGamesByStatus([GameStatus.Completed])

    const gameIds: string[] = completedGames.map(g => g.id)

    const moves: Move[] = await this.mdao.getMovesForGameIds(gameIds)

    // Create game > move mappings
    const gameMoveMapping = gameIds.reduce((map, gameId) => {
      const gameMoves = moves.filter(m => m.gameId === gameId)
      map[gameId] = gameMoves
      return map
    }, {} as GameMoveListMapping)

    return completedGames.map(g => this.createHistoryResponse(g, gameMoveMapping[g.id]))
  }

  private createHistoryResponse(game: Game, moves: Move[]): HistoryResponse {
    const playerColorLookup = {
      [game.white.id]: Color.White,
      [game.black.id]: Color.Black
    }

    return {
      gameId: game.id,
      winner: game.winner ? game.winner.username : undefined,
      result: game.result!,
      players: {
        white: game.white.username,
        black: game.black.username
      },
      finalBoard: game.board(),
      moves: moves.map(m => ({
        move: m.move,
        username: m.player.username,
        color: playerColorLookup[m.player.id],
        time: m.timestamp
      }))
    }
  }

  private createLeaderboardResponse(allPlayers: Player[], playerRecords: PlayerRecordMapping): LeaderboardResponse[] {
    // Determine each player's rank
    const scoredPlayers = allPlayers.map(p => ({ player: p, score: playerRecords[p.id].wins + 0.5 * playerRecords[p.id].draws }))
    // Sort descending order
    scoredPlayers.sort((a, b) => b.score - a.score)
    const rankedPlayers: Player[] = scoredPlayers.map(sp => sp.player)

    return rankedPlayers.map((p, idx) => ({
      username: p.username,
      rank: idx + 1,
      wins: playerRecords[p.id].wins,
      draws: playerRecords[p.id].draws,
      losses: playerRecords[p.id].losses
    }))
  }
}