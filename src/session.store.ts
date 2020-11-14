import * as session from 'express-session';
import sessionSequelize from 'connect-session-sequelize';
import { sequelizeConnection } from './dao/connection';
import { DataTypes } from 'sequelize';

const SequelizeStore = sessionSequelize(session.Store)

export const getSequelizeStore = () => new SequelizeStore({
  db: sequelizeConnection
})