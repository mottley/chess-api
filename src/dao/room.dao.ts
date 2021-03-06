import { RoomDbo } from './dbo/room.dbo';
import { Player } from '../model/player';
import { PlayerDbo } from './dbo/player.dbo';
import { Room } from '../model/room';
import { PlayerDao } from './player.dao';
import { RoomStatus } from '../model/enum';
import { Op } from 'sequelize';


export class RoomDao {

  constructor() {
    RoomDbo.sync()
  }

  async createRoom(player: Player, name: string): Promise<void> {
    const pdbo: PlayerDbo = (await PlayerDbo.findByPk(player.id))!
    const room: RoomDbo = await RoomDbo.create({
      name: name,
      status: RoomStatus.Pending
    })

    await room.addPlayer(pdbo)
  }

  async getRoomsForGames(gameIds: string[]): Promise<Room[]> {
    const rooms: RoomDbo[] = await RoomDbo.findAll({
      where: { gameId: { [Op.in]: gameIds } },
      include: [{ association: 'players' }]
    })

    return rooms.map(r => RoomDao.convert(r))
  }

  async getRoomsByStatus(statuses: RoomStatus[]): Promise<Room[]> {
    const rooms: RoomDbo[] = await RoomDbo.findAll({
      where: { status: { [Op.in]: statuses } },
      include: [{ association: 'players' }]
    })

    return rooms.map(r => RoomDao.convert(r))
  }

  async storeRoom(room: Room): Promise<void> {
    await RoomDbo.update({
      status: room.status,
      gameId: room.gameId,
    }, { where: { id: room.id } })

    const dbo: RoomDbo = (await RoomDbo.findByPk(room.id))!

    const pdbos: PlayerDbo[] = (await PlayerDbo.findAll({
      where: { id: { [Op.in]: room.players.map(p => p.id) } }
    }))
    pdbos.forEach(async p => await dbo.addPlayer(p))
  }

  static convert(dbo: RoomDbo): Room {
    const players = dbo.players!.map(p => PlayerDao.convert(p))

    return new Room(dbo.id, dbo.name, dbo.status, players, dbo.gameId)
  }
}