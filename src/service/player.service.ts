import { PlayerDao } from '../dao/player.dao';
import bcrypt from 'bcrypt';
import { SignUpRequest } from './request/sign-up.request';
import { Player } from '../model/player';
import { InvalidUsernameError } from '../error';

const SALT_ROUNDS = 10;

export class PlayerService {

  constructor(private dao: PlayerDao) { }

  async signUp(username: string, plaintextPassword: string) {
    const existingPlayer: Player | undefined = await this.dao.getPlayerByUsername(username)

    if (existingPlayer !== undefined) {
      throw new InvalidUsernameError('Username already taken!')
    }

    // TODO - verify password strength

    const hashedPassword: string = await bcrypt.hash(plaintextPassword, SALT_ROUNDS)

    return this.dao.createPlayer(username, hashedPassword)
  }

  private validatePasswordStrength(plaintextPassword: string) {

  }
}
