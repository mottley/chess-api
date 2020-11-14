import { PlayerDao } from '../dao/player.dao';
import bcrypt from 'bcrypt';
import { Player } from '../model/player';
import { InvalidUsernameError, InsecurePasswordError, InvalidCredentialsError, UnauthorizedError } from '../error';
import zxcvbn from 'zxcvbn';
import { Request } from 'express';
import { SessionDbo } from '../dao/dbo/session.dbo';
import { SignUpRequest } from './request/sign-up.request';

type Callback<A> = (args: A) => void;

const promisify = <T, A>(fn: (args: T, cb: Callback<A>) => void): ((args: T) => Promise<A>) =>
  (args: T) => new Promise((resolve) => {
    fn(args, (callbackArgs) => {
      resolve(callbackArgs);
    });
  });

const SALT_ROUNDS = 10;

export class AuthenticationService {

  constructor(private dao: PlayerDao) { SessionDbo.sync() }

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

  async login(req: Request<{}, {}, SignUpRequest>): Promise<Player> {
    const username = req.body.username
    const plaintextPassword = req.body.password

    const player: Player | undefined = await this.dao.getPlayerByUsername(username)

    if (player === undefined) {
      throw new InvalidCredentialsError()
    }

    const passwordsMatch: boolean = await bcrypt.compare(plaintextPassword, player.password)
    if (!passwordsMatch) {
      throw new InvalidCredentialsError()
    }

    // Clear all active sessions for player
    await SessionDbo.destroy({ where: { playerId: player.id } })

    // Forcibly re-generate if we already have an active session
    if (req.session.playerId !== undefined) {
      await this.regenerateSession(req)
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
}
