

export enum Color {
  White = 'white',
  Black = 'black'
}

export enum GameStatus {
  Pending = 'pending',
  InProgress = 'in progress',
  Check = 'check',
  Completed = 'completed'
}

export enum GameResult {
  Checkmate = 'checkmate',
  Draw = 'draw',
  Stalemate = 'stalemate',
  ThreefoldRepetition = 'threefold repetition',
  InsufficientMaterial = 'insufficient material'
}

export enum GameRecord {
  Win = 'win',
  Draw = 'draw',
  Loss = 'loss'
}