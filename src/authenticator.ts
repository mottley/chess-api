import { Request, Response, NextFunction } from 'express';
import { PlayerDao } from './dao/player.dao';
import { AuthenticationService } from './service/auth.service';


const playerDao = new PlayerDao();
const authService = new AuthenticationService(playerDao);

export const authenticated = (req: Request<any, any, any>, res: Response, next: NextFunction) => {
  authService.authenticate(req).then(p => {
    res.locals.player = p
    return next()
  }).catch(next)
}