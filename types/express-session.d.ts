import * as session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    playerId: string;
  }
}