import express, { Request, Response, NextFunction } from 'express';
import { SignUpRequest } from './src/service/request/sign-up.request';
import { AuthenticationService } from './src/service/auth.service';
import { PlayerDao } from './src/dao/player.dao';
import { GameService } from './src/service/game.service';
import { GameDao } from './src/dao/game.dao';
import bodyParser from 'body-parser';
import { MoveRequest, MoveParams } from './src/service/request/move.request';
import { validateMove, validateCreateRoom, validateJoinRoom } from './src/validator';
import session from 'express-session';
import { getSequelizeStore } from './src/session.store';
import { authenticated } from './src/authenticator';
import { handleErrors } from './src/error';
import { MoveDao } from './src/dao/move.dao';
import { HistoryService } from './src/service/history.service';
import { RoomRequest, RoomParams } from './src/service/request/room.request';
import { RoomService } from './src/service/room.service';
import { RoomDao } from './src/dao/room.dao';
import cors from 'cors';
import cron from 'node-cron';
import helmet from 'helmet';

const isProduction: boolean = process.env.NODE_ENV === 'production'

const playerDao = new PlayerDao();
const authService = new AuthenticationService(playerDao);

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
app.use(bodyParser.json())
app.use(session({
  secret: 'test-secret', // TODO - pull secret from environment variable here
  store: sessionStore,
  resave: false,
  rolling: true,
  cookie: {
    secure: isProduction,
    maxAge: 30 * 60 * 1000 // 30 minutes
  },
  saveUninitialized: false
}))

app.get('/player', authenticated, (req: Request, res: Response, next: NextFunction) => {
  // TODO - implement endpoint for UI to check if authenticated
})

app.post('/register', (req: Request<{}, {}, SignUpRequest>, res: Response, next: NextFunction) => {
  authService.signUp(req.body.username, req.body.password).then(r => {
    // Set player id in session
    req.session.playerId = r.id
    res.status(204).end()
  }).catch(next)
})

app.post('/login', (req: Request<{}, {}, SignUpRequest>, res: Response, next: NextFunction) => {
  authService.login(req).then(r => {
    // Set player id in session
    req.session.playerId = r.id
    res.status(200).send(r.response)
  }).catch(next)
})

app.post('/room', authenticated, validateCreateRoom, (req: Request<{}, {}, RoomRequest>, res: Response, next: NextFunction) => {
  roomService.createRoom(res.locals.player, req.body.roomName).then(() => {
    res.status(200).end()
  }).catch(next)
})

app.get('/room', authenticated, (req: Request<{}, {}, RoomRequest>, res: Response, next: NextFunction) => {
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

app.listen(8000, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:8000`);
});