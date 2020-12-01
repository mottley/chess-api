import { RateLimiterMySQL } from 'rate-limiter-flexible';
import { sequelizeConnection } from '../dao/connection';
import { RateLimitedError } from '../error';

const MAX_CONSECUTIVE_FAILS_BY_USERNAME = 5;

const limiterByUsername = new RateLimiterMySQL({
  storeClient: sequelizeConnection,
  keyPrefix: 'login_fail_consecutive_username',
  points: MAX_CONSECUTIVE_FAILS_BY_USERNAME,
  duration: 60 * 60, // Store number for 1 hour since first fail
})

export class RateLimitService {

  async checkUsernameLoginLimited(username: string) {
    const limit = await limiterByUsername.get(username)
    if (limit === null) {
      return
    }

    if (limit.consumedPoints >= MAX_CONSECUTIVE_FAILS_BY_USERNAME) {
      throw new RateLimitedError();
    }
  }

  async addPointForUsername(username: string) {
    await limiterByUsername.consume(username)
  }

  async clearLimitForUsername(username: string) {
    const existingLimit = await limiterByUsername.get(username)
    if (existingLimit && existingLimit.consumedPoints > 0) {
      await limiterByUsername.delete(username)
    }
  }

}