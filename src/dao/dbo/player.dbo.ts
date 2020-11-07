import { Model, DataTypes, Sequelize, InitOptions, Optional } from 'sequelize';
import { getOptions } from '../connection';

interface PlayerAttributes {
  id: string,
  username: string,
  password: string
}

interface PlayerCreationAttributes extends Optional<PlayerAttributes, 'id'> { }

const options: InitOptions = getOptions('Player');

export class PlayerDbo extends Model<PlayerAttributes, PlayerCreationAttributes> implements PlayerAttributes {
  public id!: string;
  public username!: string;
  public password!: string;
}

PlayerDbo.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
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