import { Sequelize, InitOptions } from 'sequelize';

const username: string = process.env.DB_USERNAME || ''
const password: string = process.env.DB_PASSWORD || ''
const host: string = process.env.DB_HOST || ''

export const sequelizeConnection = new Sequelize('chess', username, password, {
  host,
  dialect: 'mysql'
})

export const getOptions = (modelName: string): InitOptions => {
  return {
    sequelize: sequelizeConnection,
    modelName
  }
}