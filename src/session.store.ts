import * as session from 'express-session';
import sessionSequelize from 'connect-session-sequelize';
import { sequelizeConnection } from './dao/connection';

interface DefaultFields {
  data: string,
  expires: Date
}

const SequelizeStore = sessionSequelize(session.Store)

const extendDefaultFields = (defaults: DefaultFields, playerSession: session.SessionData) => {
  return {
    data: defaults.data,
    expires: defaults.expires,
    PlayerId: playerSession.playerId
  };
}

export const getSequelizeStore = () => new SequelizeStore({
  db: sequelizeConnection,
  table: 'Session',
  extendDefaultFields: extendDefaultFields
})