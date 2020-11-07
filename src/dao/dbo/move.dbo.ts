import { Model, DataTypes, Sequelize, InitOptions } from 'sequelize';
import { GameDbo } from './game.dbo';
import { PlayerDbo } from './player.dbo';
import { getOptions } from '../connection';

const options: InitOptions = getOptions('Move');

export class MoveDbo extends Model { }

MoveDbo.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  move: {
    type: DataTypes.STRING,
    allowNull: false
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false
  }
},
  options
);

MoveDbo.belongsTo(GameDbo);
MoveDbo.belongsTo(PlayerDbo);