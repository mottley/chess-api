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

const playerDao = new PlayerDao();
const authService = new AuthenticationService(playerDao);

const gameDao = new GameDao();
const gameService = new GameService(gameDao);


const sessionStore = getSequelizeStore();

const app = express();
app.use(bodyParser.json())
app.use(session({
  secret: 'test-secret',
  store: sessionStore,
  resave: false,
  // cookie: { secure: true } TODO - for prod
  saveUninitialized: false
}))

// sessionStore.sync()

app.get('/', (req, res) => res.send('Express + TypeScript Server'));

app.post('/register', (req: Request<{}, {}, SignUpRequest>, res: Response, next: NextFunction) => {
  // console.log('Request body: ', req.body)
  authService.signUp(req.body.username, req.body.password).then(() => {
    res.status(204).end()
  }).catch(next)
})

app.post('/login', (req: Request<{}, {}, SignUpRequest>, res: Response, next: NextFunction) => {
  // console.log('Request body: ', req.body)
  authService.login(req).then(r => {
    req.session.playerId = r.id
    res.status(200).send(r)
  }).catch(next)
})

app.post('/game', async (req, res, next) => {
  const player1 = await playerDao.getPlayerByUsername('clayton')
  const player2 = await playerDao.getPlayerByUsername('clayton5')


  // const game = new Game([])

  // gameDao.createGame(game.rep(), [player1!, player2!]).then(() => {
  //   res.send('game created')
  // })

  gameService.startGame([player1!, player2!]).then(id => {
    res.status(200).send(id)
  }).catch(next)
})

app.post('/game/:gameId/move', authenticated, validateMove, (req: Request<MoveParams, {}, MoveRequest>, res: Response, next: NextFunction) => {
  gameService.makeMove(res.locals.player, req.params.gameId, req.body.move).then(() => {
    res.status(200).end()
  }).catch(next)
})

app.get('/session', authenticated, (req, res) => {
  console.log(res.locals.player)
  res.send(req.session.playerId)
})

app.use(handleErrors)

app.listen(8000, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:8000`);
});