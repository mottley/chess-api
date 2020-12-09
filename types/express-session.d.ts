import * as session from 'express-session'; // NOSONAR

declare module 'express-session' {
  interface SessionData {
    playerId: string;
  }
}