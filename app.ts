import express, { Request, Response } from 'express';
import { SignUpRequest } from './src/service/request/sign-up.request';
import { PlayerService } from './src/service/player.service';
import { PlayerDao } from './src/dao/player.dao';
import { GameService } from './src/service/game.service';
import { GameDao } from './src/dao/game.dao';
import bodyParser from 'body-parser';
import { PlayerDbo } from './src/dao/dbo/player.dbo';
import { Game } from './src/model/game';
import { GameDbo } from './src/dao/dbo/game.dbo';
import { MoveRequest, MoveParams } from './src/service/request/move.request';

const playerDao = new PlayerDao();
const playerService = new PlayerService(playerDao);

const gameDao = new GameDao();
const gameService = new GameService(gameDao);

const app = express();
app.use(bodyParser.json())

app.get('/', (req, res) => res.send('Express + TypeScript Server'));

app.post('/register', (req: Request<{}, {}, SignUpRequest>, res: Response) => {
  console.log('Request body: ', req.body)
  playerService.signUp(req.body.username, req.body.password).then(() => {
    res.status(204).end()
  })
})

app.post('/login', (req: Request<{}, {}, SignUpRequest>, res: Response) => {
  console.log('Request body: ', req.body)
  playerService.login(req.body.username, req.body.password).then(r => {
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

app.post('/game/:gameId/move', (req: Request<MoveParams, {}, MoveRequest>, res: Response) => {
  gameService.makeMove(req.body.username, req.params.gameId, req.body.move).then(() => {
    res.status(200).end()
  })
})

app.listen(8000, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:8000`);
});