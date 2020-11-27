import { SessionDbo } from './dbo/session.dbo';


export class SessionDao {

  constructor() {
    SessionDbo.sync()
  }

  async deleteSessionsByPlayerId(playerId: string) {
    await SessionDbo.destroy({ where: { playerId: playerId } })
  }
}