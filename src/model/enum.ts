

export enum Color {
  White = 'white',
  Black = 'black'
}

export enum GameStatus {
  InProgress = 'in progress',
  Check = 'check',
  Completed = 'completed'
}

export enum GameResult {
  Forfeit = 'forfeit',
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

export enum RoomStatus {
  Pending = 'pending',
  InProgress = 'in progress',
  Closed = 'closed'
}