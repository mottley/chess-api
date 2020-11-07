import { Model, DataTypes, Sequelize, InitOptions } from 'sequelize';
import { GameStatus } from '../../model/enum';
import { getOptions } from '../connection';

const options: InitOptions = getOptions('Game');

export class GameDbo extends Model { }

GameDbo.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(GameStatus),
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastUpdate: {
    type: DataTypes.TIME,
    allowNull: false
  },
  winner: {
    type: DataTypes.STRING,
  },
  endReason: {
    type: DataTypes.STRING
  }
},
  options
);