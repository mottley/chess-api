import * as session from 'express-session';
import sessionSequelize from 'connect-session-sequelize';
import { sequelizeConnection } from './dao/connection';

interface DefaultFields {
  data: string,
  expires: Date
}

const SequelizeStore = sessionSequelize(session.Store)

const extendDefaultFields = (defaults: DefaultFields, session: session.SessionData) => {
  return {
    data: defaults.data,
    expires: defaults.expires,
    PlayerId: session.playerId
  };
}

export const getSequelizeStore = () => new SequelizeStore({
  db: sequelizeConnection,
  table: 'Session',
  extendDefaultFields: extendDefaultFields
})