import { Player } from '../model/player';
import { PlayerDbo } from './dbo/player.dbo';


export class PlayerDao {

  getPlayerByUsername(username: string): Promise<Player | undefined> {
    return PlayerDbo.findOne({ where: { username } })
      .then(p => {
        if (p === null) {
          return undefined
        }

        return PlayerDao.convert(p)
      })
  }

  static convert(dbo: PlayerDbo): Player {
    const player = new Player()
    player.id = dbo.id
    player.username = dbo.username
    player.password = dbo.password

    return player
  }
}

new PlayerDao().getPlayerByUsername('test').then(p => console.log(p.username))