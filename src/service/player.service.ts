import { PlayerDao } from '../dao/player.dao';
import bcrypt from 'bcrypt';
import { Player } from '../model/player';
import { InvalidUsernameError, InsecurePasswordError } from '../error';
import zxcvbn from 'zxcvbn';

const SALT_ROUNDS = 10;

export class PlayerService {

  constructor(private dao: PlayerDao) { }

  async signUp(username: string, plaintextPassword: string) {
    const existingPlayer: Player | undefined = await this.dao.getPlayerByUsername(username)

    if (existingPlayer !== undefined) {
      throw new InvalidUsernameError('Username already taken!')
    }

    if (!this.isPasswordStrong(plaintextPassword, username)) {
      throw new InsecurePasswordError('Password is too weak!')
    }

    const hashedPassword: string = await bcrypt.hash(plaintextPassword, SALT_ROUNDS)

    return this.dao.createPlayer(username, hashedPassword)
  }

  private isPasswordStrong(plaintextPassword: string, username: string): boolean {
    // Add in username in password to ensure username is not used as password
    return zxcvbn(plaintextPassword, [username]).score >= 3
  }
}
