import { RoomDao } from '../dao/room.dao';
import { Player } from '../model/player';
import { Room } from '../model/room';
import { GameService } from './game.service';
import { RoomNotFoundError } from '../error';


export class RoomService {

  constructor(private dao: RoomDao, private gservice: GameService) { }

  async createRoom(authenticatedPlayer: Player, name: string): Promise<void> {
    // TODO - see if validation for room name needed
    await this.dao.createRoom(authenticatedPlayer, name)
  }

  async joinRoom(authenticatedPlayer: Player, roomId: string) {
    const room: Room | undefined = await this.dao.getRoomById(roomId)

    if (room === undefined) {
      throw new RoomNotFoundError()
    }

    // TODO - see if theres anything to change here w/ how rooms work
    const players: Player[] = [...room.players, authenticatedPlayer]
    await this.gservice.startGame(players)
  }
}