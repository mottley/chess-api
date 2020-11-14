import express, { Request, Response } from 'express';
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

sessionStore.sync()

app.get('/', (req, res) => res.send('Express + TypeScript Server'));

app.post('/register', (req: Request<{}, {}, SignUpRequest>, res: Response) => {
  console.log('Request body: ', req.body)
  authService.signUp(req.body.username, req.body.password).then(() => {
    res.status(204).end()
  })
})

app.post('/login', (req: Request<{}, {}, SignUpRequest>, res: Response) => {
  console.log('Request body: ', req.body)
  authService.login(req.body.username, req.body.password).then(r => {
    req.session.playerId = r.id
    res.status(200).send(r)
  })
})

app.post('/game', async (req, res) => {
  const player1 = await PlayerDbo.findOne({ where: { username: 'clayton' } })
  const player2 = await PlayerDbo.findOne({ where: { username: 'clayton2' } })

  const game = new Game([])

  gameDao.createGame(game.rep(), [player1!, player2!]).then(() => {
    res.send('game created')
  })
})

app.post('/game/:gameId/move', authenticated, validateMove, (req: Request<MoveParams, {}, MoveRequest>, res: Response) => {
  gameService.makeMove(res.locals.player, req.params.gameId, req.body.move).then(() => {
    res.status(200).end()
  })
})

app.get('/session', authenticated, (req, res) => {
  console.log(res.locals.player)
  res.send(req.session.playerId)
})

app.listen(8000, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:8000`);
});