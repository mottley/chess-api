import { RateLimiterMySQL } from 'rate-limiter-flexible';
import { sequelizeConnection } from '../dao/connection';
import { RateLimitedError } from '../error';
import { logger } from '../logger';


const log = logger('RateLimitService')

const MAX_CONSECUTIVE_FAILS_BY_USERNAME = 5;
const MAX_REQUESTS_PER_MINUTE = 35;

const limiterByUsername = new RateLimiterMySQL({
  storeClient: sequelizeConnection,
  keyPrefix: 'login_fail_consecutive_username',
  points: MAX_CONSECUTIVE_FAILS_BY_USERNAME,
  duration: 60 * 60, // Store number for 1 hour since first fail
})

const defaultLimiter = new RateLimiterMySQL({
  storeClient: sequelizeConnection,
  keyPrefix: 'default_limiter',
  points: MAX_REQUESTS_PER_MINUTE,
  duration: 60 // Store for one minute
})

export class RateLimitService {

  async checkUsernameLoginLimited(username: string) {
    const limit = await limiterByUsername.get(username)
    if (limit === null) {
      return
    }

    if (limit.consumedPoints >= MAX_CONSECUTIVE_FAILS_BY_USERNAME) {
      log.info(`Player: ${username} has execeeded the max login attempts - rate limiting...`)
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

  async checkDefaultLimited(ip: string) {
    const limit = await defaultLimiter.get(ip)

    if (limit !== null && limit.consumedPoints >= MAX_REQUESTS_PER_MINUTE) {
      log.info(`IP: ${ip} has execeeded the max request attempts - rate limiting...`)
      throw new RateLimitedError();
    }

    await defaultLimiter.consume(ip)
  }
}