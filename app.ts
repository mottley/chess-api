import express, { Request, Response, NextFunction } from 'express';
import { SignUpRequest } from './src/service/request/sign-up.request';
import { AuthenticationService } from './src/service/auth.service';
import { PlayerDao } from './src/dao/player.dao';
import { GameService } from './src/service/game.service';
import { GameDao } from './src/dao/game.dao';
import bodyParser from 'body-parser';
import { PlayerDbo } from './src/dao/dbo/player.dbo';
import { Game } from './src/model/game';
import { GameDbo } from './src/dao/dbo/game.dbo';
import { MoveRequest, MoveParams } from './src/service/request/move.request';
import { validateMove } from './src/validator';
import session from 'express-session';
import { getSequelizeStore } from './src/session.store';
import { authenticated } from './src/authenticator';
import { handleErrors } from './src/error';
import { MoveDao } from './src/dao/move.dao';
import { sequelizeConnection } from './src/dao/connection';
import { HistoryService } from './src/service/history.service';
import { RoomRequest } from './src/service/request/room.request';
import { RoomService } from './src/service/room.service';
import { RoomDao } from './src/dao/room.dao';
import cors from 'cors';
import cron from 'node-cron';

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
app.use(cors({ credentials: true }))
app.use(bodyParser.json())
app.use(session({
  secret: 'test-secret',
  store: sessionStore,
  resave: false,
  // cookie: { secure: true } TODO - for prod
  saveUninitialized: false
}))

app.get('/', (req, res) => res.send('Express + TypeScript Server'));

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
    res.status(200).send(r)
  }).catch(next)
})

app.post('/room', authenticated, (req: Request<{}, {}, RoomRequest>, res: Response, next: NextFunction) => {
  roomService.createRoom(res.locals.player, req.body.name).then(() => {
    res.status(200).end()
  }).catch(next)
})

app.get('/room', authenticated, (req: Request<{}, {}, RoomRequest>, res: Response, next: NextFunction) => {
  roomService.getRooms().then(rs => {
    res.status(200).send(rs)
  }).catch(next)
})

app.post('/room/:roomName', authenticated, (req: Request, res: Response, next: NextFunction) => {
  roomService.joinRoom(res.locals.player, req.params.roomName).then(() => {
    res.status(200).end()
  }).catch(next)
})

// app.post('/game', async (req, res, next) => {
//   const player1 = await playerDao.getPlayerByUsername('clayton')
//   const player2 = await playerDao.getPlayerByUsername('clayton1')


//   // const game = new Game([])

//   // gameDao.createGame(game.rep(), [player1!, player2!]).then(() => {
//   //   res.send('game created')
//   // })

//   gameService.startGame([player1!, player2!]).then(id => {
//     res.status(200).send(id)
//   }).catch(next)
// })

app.get('/player', authenticated, (req: Request, res: Response, next: NextFunction) => {
  // TODO - implement endpoint for UI to check if authenticated
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

app.get('/game/:gameId/move', authenticated, (req: Request<MoveParams>, res: Response, next: NextFunction) => {
  historyService.getGameMoves(res.locals.player, req.params.gameId).then(moves => {
    res.status(200).send(moves)
  }).catch(next)
})

app.get('/session', authenticated, (req, res) => {
  console.log(res.locals.player)
  res.send(req.session.playerId)
})

app.get('/record', authenticated, (req, res) => {
  historyService.getPlayerRecords().then(r => {
    res.send(200)
  })
})


app.use(handleErrors)

cron.schedule('* * * * *', () => {
  console.log('checking for expired games')
  gameService.forfeitExpiredGames()
})

// gameService.forfeitExpiredGames()

app.listen(8000, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:8000`);
});