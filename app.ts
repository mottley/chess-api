import express, { Request, Response } from 'express';
import { SignUpRequest } from './src/service/request/sign-up.request';
import { PlayerService } from './src/service/player.service';
import { PlayerDao } from './src/dao/player.dao';
import bodyParser from 'body-parser';

const playerDao = new PlayerDao();
const playerService = new PlayerService(playerDao);


const app = express();
app.use(bodyParser.json())

app.get('/', (req, res) => res.send('Express + TypeScript Server'));

app.post('/register', (req: Request<{}, {}, SignUpRequest>, res: Response) => {
  console.log('Request body: ', req.body)
  playerService.signUp(req.body.username, req.body.password).then(() => {
    res.status(204).end()
  })
})

app.listen(8000, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:8000`);
});