import express from 'express';

const app = express();

app.get('/', (req, res) => res.send('Express + TypeScript Server'));

app.listen(8000, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:8000`);
});