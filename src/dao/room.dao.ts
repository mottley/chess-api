import { RoomDbo } from './dbo/room.dbo';
import { Player } from '../model/player';
import { PlayerDbo } from './dbo/player.dbo';
import { Room } from '../model/room';
import { PlayerDao } from './player.dao';


export class RoomDao {

  constructor() {
    RoomDbo.sync()
  }

  async createRoom(player: Player, name: string): Promise<void> {
    const pdbo: PlayerDbo = (await PlayerDbo.findByPk(player.id))!
    const room: RoomDbo = await RoomDbo.create({
      name: name
    })

    await room.addPlayer(pdbo)
  }

  async getRoomById(id: string): Promise<Room | undefined> {
    const room: RoomDbo | null = await RoomDbo.findByPk(id)

    if (room === null) {
      return undefined
    }

    const players: PlayerDbo[] = await room.getPlayers()

    return RoomDao.convert(room, players)
  }

  async getRooms(): Promise<Room[]> {
    const rooms: RoomDbo[] = await RoomDbo.findAll()

    return []
  }

  async deleteRoom(room: Room): Promise<void> {
    RoomDbo.destroy({ where: { id: room.id } })
  }

  static convert(dbo: RoomDbo, pdbos: PlayerDbo[]): Room {
    const players = pdbos.map(p => PlayerDao.convert(p))

    return new Room(dbo.id, dbo.name, players)
  }
}