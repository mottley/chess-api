import express, { Request, Response, NextFunction } from 'express';
import { AuthenticationService } from './src/service/auth.service';
import { PlayerDao } from './src/dao/player.dao';
import { GameService } from './src/service/game.service';
import { GameDao } from './src/dao/game.dao';
import bodyParser from 'body-parser';
import { MoveRequest, MoveParams } from './src/model/request/move.request';
import { validateMove, validateCreateRoom, validateJoinRoom, validateLoginOrRegistration, validateGetGame } from './src/validator';
import session from 'express-session';
import { getSequelizeStore } from './src/session.store';
import { authenticated } from './src/authenticator';
import { handleErrors } from './src/error';
import { MoveDao } from './src/dao/move.dao';
import { HistoryService } from './src/service/history.service';
import { RoomRequest, RoomParams } from './src/model/request/room.request';
import { RoomService } from './src/service/room.service';
import { RoomDao } from './src/dao/room.dao';
import cors from 'cors';
import cron from 'node-cron';
import helmet from 'helmet';
import { SessionDao } from './src/dao/session.dao';
import https from 'https';
import fs from 'fs';
import { RegisterRequest, LoginRequest } from './src/model/request/login.request';
import { rateLimiter } from './src/limiter';

const key = fs.readFileSync('./.cert/localhost.key')
const certificate = fs.readFileSync('./.cert/localhost.crt')
const sslConfig = { key: key, cert: certificate }

const isProduction: boolean = process.env.NODE_ENV === 'production'

const playerDao = new PlayerDao();
const sessionDao = new SessionDao();
const authService = new AuthenticationService(playerDao, sessionDao);

const gameDao = new GameDao();
const moveDao = new MoveDao();
const roomDao = new RoomDao();
const gameService = new GameService(gameDao, moveDao, roomDao);

const historyService = new HistoryService(gameDao, moveDao, playerDao);

const roomService = new RoomService(roomDao, gameService);

const sessionStore = getSequelizeStore();

const app = express();

if (!isProduction) {
  app.use(cors({ credentials: true }))
}

app.use(helmet())
app.use(bodyParser.json({
  type: () => true // Attempt to parse all requests (throws error if not valid JSON)
}))

app.use(session({
  secret: 'test-secret', // TODO - pull secret from environment variable here
  store: sessionStore,
  resave: false,
  rolling: true,
  cookie: {
    secure: isProduction,
    maxAge: 30 * 60 * 1000 // 30 minutes
  },
  saveUninitialized: false,
  name: 'id'
}))

app.use(rateLimiter)

app.get('/player', authenticated, (req: Request, res: Response, next: NextFunction) => {
  // TODO - implement endpoint for UI to check if authenticated
})

app.post('/register', validateLoginOrRegistration, (req: Request<{}, {}, RegisterRequest>, res: Response, next: NextFunction) => {
  authService.signUp(req.body.username, req.body.password).then(r => {
    // Set player id in session
    req.session.playerId = r.id
    res.status(204).end()
  }).catch(next)
})

app.post('/login', validateLoginOrRegistration, (req: Request<{}, {}, LoginRequest>, res: Response, next: NextFunction) => {
  authService.login(req).then(r => {
    // Set player id in session
    req.session.playerId = r.id
    res.status(200).send(r.response)
  }).catch(next)
})

app.post('/logout', authenticated, (req: Request, res: Response, next: NextFunction) => {
  authService.logout(req).then(() => {
    res.status(204).end()
  }).catch(next)
})

app.post('/room', authenticated, validateCreateRoom, (req: Request<{}, {}, RoomRequest>, res: Response, next: NextFunction) => {
  roomService.createRoom(res.locals.player, req.body.roomName).then(() => {
    res.status(200).end()
  }).catch(next)
})

app.get('/room', authenticated, (req: Request<{}, {}, {}>, res: Response, next: NextFunction) => {
  roomService.getRooms().then(rs => {
    res.status(200).send(rs)
  }).catch(next)
})

app.post('/room/:roomName', authenticated, validateJoinRoom, (req: Request<RoomParams, {}, {}>, res: Response, next: NextFunction) => {
  roomService.joinRoom(res.locals.player, req.params.roomName).then(() => {
    res.status(200).end()
  }).catch(next)
})

app.get('/game/:gameId', authenticated, (req: Request<MoveParams, {}, {}>, res: Response, next: NextFunction) => {
  gameService.getGame(res.locals.player, req.params.gameId).then(g => {
    res.status(200).send(g)
  }).catch(next)
})

app.post('/game/:gameId/move', authenticated, validateMove, (req: Request<MoveParams, {}, MoveRequest>, res: Response, next: NextFunction) => {
  gameService.makeMove(res.locals.player, req.params.gameId, req.body.move).then(g => {
    res.status(200).send(g)
  }).catch(next)
})

app.get('/leaderboard', authenticated, (req, res, next) => {
  historyService.getLeaderboard().then(r => {
    res.status(200).send(r)
  }).catch(next)
})


// TODO - update to /game/history?
app.get('/history', authenticated, (req, res, next) => {
  historyService.getGameHistory().then(r => {
    res.status(200).send(r)
  }).catch(next)
})

app.use(handleErrors)

cron.schedule('* * * * *', () => {
  console.log('checking for expired games')
  gameService.forfeitExpiredGames()
})

if (isProduction) {
  const server = https.createServer(sslConfig, app)
  server.listen(8443)
}
else {
  app.listen(8000, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:8000`);
  });
}

export default app;