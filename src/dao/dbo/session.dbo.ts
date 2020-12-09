import { Model, DataTypes, InitOptions } from 'sequelize';
import { getOptions } from '../connection';
import { PlayerDbo } from './player.dbo';

const options: InitOptions = getOptions('Session');

export class SessionDbo extends Model { }

SessionDbo.init({
  sid: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  expires: DataTypes.DATE,
  data: DataTypes.TEXT,
},
  options
);

SessionDbo.belongsTo(PlayerDbo);

options.sequelize.sync()