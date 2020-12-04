import { Request, Response, NextFunction } from 'express';
import { RateLimitService } from './service/rate.service';


const rateLimitService = new RateLimitService();

export const rateLimiter = (req: Request<any, any, any>, res: Response, next: NextFunction) => {
  rateLimitService.checkDefaultLimited(req.ip).then(() => {
    return next()
  }).catch(next)
}