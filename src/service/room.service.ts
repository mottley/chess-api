import { RoomDao } from '../dao/room.dao';
import { Player } from '../model/player';
import { Room } from '../model/room';
import { GameService } from './game.service';
import { RoomNotFoundError, BadRequestError } from '../error';
import { RoomResponse } from './response/room.response';
import { RoomStatus } from '../model/enum';
import { GameResponse } from './response/game.response';


export class RoomService {

  constructor(private dao: RoomDao, private gservice: GameService) { }

  async createRoom(authenticatedPlayer: Player, name: string): Promise<void> {
    const activeRooms: Room[] = await this.dao.getRoomsByStatus([RoomStatus.Pending, RoomStatus.InProgress])

    // Check that player is not already in another room
    const otherRoom: Room | undefined = activeRooms.find(r => r.players.find(p => p.id === authenticatedPlayer.id))
    if (otherRoom !== undefined) {
      throw new BadRequestError('One player cannot be in multiple rooms at once!')
    }

    // Check that room name isn't already taken
    const room: Room | undefined = activeRooms.find(r => r.name === name)
    if (room !== undefined) {
      throw new BadRequestError(`Active room with name ${name} already exists! Please choose a different name.`)
    }

    await this.dao.createRoom(authenticatedPlayer, name)
  }

  async joinRoom(authenticatedPlayer: Player, name: string): Promise<GameResponse> {
    const activeRooms: Room[] = await this.dao.getRoomsByStatus([RoomStatus.Pending, RoomStatus.InProgress])

    const room: Room | undefined = activeRooms.find(r => r.name === name)

    if (room === undefined) {
      throw new RoomNotFoundError()
    }

    // Check that player is not already in another room
    const otherRoom: Room | undefined = activeRooms.find(r => r.players.find(p => p.id === authenticatedPlayer.id))
    if (otherRoom !== undefined) {
      throw new BadRequestError('One player cannot be in multiple rooms at once!')
    }

    // TODO - check if there are enough players
    const players: Player[] = [...room.players, authenticatedPlayer]
    const gameResponse: GameResponse = await this.gservice.startGame(players)

    room.gameId = gameResponse.gameId
    room.status = RoomStatus.InProgress
    room.players = players

    await this.dao.storeRoom(room)

    return gameResponse
  }

  async getRooms(): Promise<RoomResponse[]> {
    const activeRooms: Room[] = await this.dao.getRoomsByStatus([RoomStatus.Pending, RoomStatus.InProgress])
    return activeRooms.map(r => this.createResponse(r))
  }

  private createResponse(room: Room): RoomResponse {
    return {
      id: room.id,
      name: room.name,
      players: room.players.map(p => ({ id: p.id, username: p.username })),
      gameId: room.gameId
    }
  }
}