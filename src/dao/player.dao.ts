import { Player } from '../model/player';
import { PlayerDbo } from './dbo/player.dbo';

export class PlayerDao {

  constructor() {
    PlayerDbo.sync()
  }

  async createPlayer(username: string, hashedPassword: string): Promise<Player> {
    const player: PlayerDbo = await PlayerDbo.create({
      username,
      password: hashedPassword
    })

    return PlayerDao.convert(player)
  }

  async getPlayerById(id: string): Promise<Player | undefined> {
    return PlayerDbo.findByPk(id).then(p => {
      if (p === null) {
        return undefined
      }

      return PlayerDao.convert(p)
    })
  }

  async getPlayerByUsername(username: string): Promise<Player | undefined> {
    return PlayerDbo.findOne({ where: { username } })
      .then(p => {
        if (p === null) {
          return undefined
        }

        return PlayerDao.convert(p)
      })
  }

  async getAllPlayers(): Promise<Player[]> {
    const players: PlayerDbo[] = await PlayerDbo.findAll()
    return players.map(p => PlayerDao.convert(p))
  }

  static convert(dbo: PlayerDbo): Player {
    return new Player(dbo.id, dbo.username, dbo.password)
  }
}
