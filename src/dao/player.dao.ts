import { Player } from '../model/player';
import { PlayerDbo } from './dbo/player.dbo';

export class PlayerDao {

  constructor() {
    PlayerDbo.sync()
  }

  async createPlayer(username: string, hashedPassword: string): Promise<void> {
    return PlayerDbo.create({
      username,
      password: hashedPassword
    })
      .then(p => {
        return
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

  static convert(dbo: PlayerDbo): Player {
    return new Player(dbo.id, dbo.username, dbo.password)
  }
}
