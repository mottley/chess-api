import { Model, DataTypes, Sequelize, InitOptions } from 'sequelize';
import { getOptions } from '../connection';

const options: InitOptions = getOptions('Player');

export class PlayerDbo extends Model { }

PlayerDbo.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
},
  options
);