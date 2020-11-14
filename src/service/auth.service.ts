import { PlayerDao } from '../dao/player.dao';
import bcrypt from 'bcrypt';
import { Player } from '../model/player';
import { InvalidUsernameError, InsecurePasswordError, InvalidCredentialsError, UnauthorizedError } from '../error';
import zxcvbn from 'zxcvbn';
import { Request } from 'express';

const SALT_ROUNDS = 10;

export class AuthenticationService {

  constructor(private dao: PlayerDao) { }

  async signUp(username: string, plaintextPassword: string) {
    const player: Player | undefined = await this.dao.getPlayerByUsername(username)

    if (player !== undefined) {
      throw new InvalidUsernameError('Username already taken!')
    }

    if (!this.isPasswordStrong(plaintextPassword, username)) {
      throw new InsecurePasswordError('Password is too weak!')
    }

    const hashedPassword: string = await bcrypt.hash(plaintextPassword, SALT_ROUNDS)

    return this.dao.createPlayer(username, hashedPassword)
  }

  async login(username: string, plaintextPassword: string): Promise<Player> {
    const player: Player | undefined = await this.dao.getPlayerByUsername(username)

    if (player === undefined) {
      throw new InvalidCredentialsError()
    }

    const passwordsMatch: boolean = await bcrypt.compare(plaintextPassword, player.password)
    if (!passwordsMatch) {
      throw new InvalidCredentialsError()
    }

    return player
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

  private isPasswordStrong(plaintextPassword: string, username: string): boolean {
    // Add in username in password to ensure username is not used as password
    return zxcvbn(plaintextPassword, [username]).score >= 3
  }
}
