import { PlayerDao } from '../dao/player.dao';
import bcrypt from 'bcrypt';
import { Player } from '../model/player';
import { InvalidUsernameError, InsecurePasswordError, InvalidCredentialsError, UnauthorizedError } from '../error';
import zxcvbn from 'zxcvbn';
import { Request } from 'express';
import { PlayerResponse } from '../model/response/player.response';
import { SessionDao } from '../dao/session.dao';
import { LoginRequest } from '../model/request/login.request';
import { RateLimitService } from './rate.service';

const SALT_ROUNDS = 10;

const rateLimitService = new RateLimitService();

export class AuthenticationService {

  constructor(private dao: PlayerDao, private sdao: SessionDao) { }

  async signUp(username: string, plaintextPassword: string) {
    const player: Player | undefined = await this.dao.getPlayerByUsername(username)

    if (player !== undefined) {
      throw new InvalidUsernameError('Username already taken!')
    }

    if (!this.isPasswordStrong(plaintextPassword, username)) {
      throw new InsecurePasswordError('Password is too weak!')
    }

    const hashedPassword: string = await bcrypt.hash(plaintextPassword, SALT_ROUNDS)
    const newPlayer: Player = await this.dao.createPlayer(username, hashedPassword)

    return { id: newPlayer.id, response: this.createResponse(newPlayer) }
  }

  async login(req: Request<{}, {}, LoginRequest>) {
    const username = req.body.username
    const plaintextPassword = req.body.password

    await rateLimitService.checkUsernameLoginLimited(username)

    const player: Player | undefined = await this.dao.getPlayerByUsername(username)

    if (player === undefined) {
      await rateLimitService.addPointForUsername(username)
      throw new InvalidCredentialsError()
    }

    const passwordsMatch: boolean = await bcrypt.compare(plaintextPassword, player.password)
    if (!passwordsMatch) {
      await rateLimitService.addPointForUsername(username)
      throw new InvalidCredentialsError()
    }

    // Clear all active sessions for player
    await this.sdao.deleteSessionsByPlayerId(player.id)

    // Forcibly re-generate if we already have an active session
    if (req.session.playerId !== undefined) {
      await this.regenerateSession(req)
    }

    await rateLimitService.clearLimitForUsername(username)

    return { id: player.id, response: this.createResponse(player) }
  }

  async getPlayer(authenticatedPlayer: Player) {
    return this.createResponse(authenticatedPlayer)
  }

  async logout(req: Request): Promise<void> {
    const playerId: string | undefined = req.session.playerId

    if (playerId === undefined) {
      return
    }

    await this.destroySession(req)

    // Clear all active sessions for player
    await this.sdao.deleteSessionsByPlayerId(playerId)
  }

  async authenticate(req: Request): Promise<Player> {
    const playerId: string | undefined = req.session.playerId

    if (playerId === undefined) {
      throw new UnauthorizedError('Not authenticated!')
    }

    const player: Player | undefined = await this.dao.getPlayerById(playerId)

    if (player === undefined) {
      throw new InvalidUsernameError() // TODO - change to invalid player
    }

    return player
  }

  private createResponse(player: Player): PlayerResponse {
    return {
      username: player.username
    }
  }

  private isPasswordStrong(plaintextPassword: string, username: string): boolean {
    // Add in username in password to ensure username is not used as password
    return zxcvbn(plaintextPassword, [username]).score >= 3
  }

  private regenerateSession(req: Request): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.regenerate((err: any) => {
        if (err != null) {
          reject(err)
        }
        resolve()
      })
    })
  }

  private destroySession(req: Request): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err: any) => {
        if (err != null) {
          reject(err)
        }
        resolve()
      })
    })
  }
}
