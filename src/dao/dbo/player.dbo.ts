import { Model, DataTypes, Sequelize, InitOptions } from 'sequelize';
import { getOptions } from '../connection';

interface PlayerAttributes {
  id: string,
  username: string,
  password: string
}

const options: InitOptions = getOptions('Player');

export class PlayerDbo extends Model<PlayerAttributes> implements PlayerAttributes {
  public id!: string;
  public username!: string;
  public password!: string;
}

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