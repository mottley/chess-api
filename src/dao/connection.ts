import { Sequelize, InitOptions } from 'sequelize';

const username = process.env.DB_USERNAME
const password = process.env.DB_PASSWORD

const host = process.env.DB_HOST

const sequelizeConnection = new Sequelize('chess', username, password, {
  host,
  dialect: 'mysql'
})

export const getOptions = (modelName: string): InitOptions => {
  return {
    sequelize: sequelizeConnection,
    modelName
  }
}