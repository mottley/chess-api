import { Model, DataTypes, Sequelize, InitOptions } from 'sequelize';
import { GameStatus } from '../../model/enum';
import { getOptions } from '../connection';
import { Game } from '../../model/game';
import { PlayerDbo } from './player.dbo';

interface GameAttributes {
  id: string,
  status: GameStatus,
  board: string,
  lastUpdate: Date,
  winner: PlayerDbo,
  players: PlayerDbo[]
}

const options: InitOptions = getOptions('Game');

export class GameDbo extends Model<GameAttributes> implements GameAttributes {
  public id!: string
  public status!: GameStatus
  public board!: string
  public lastUpdate!: Date
  public winner!: PlayerDbo
  public players!: PlayerDbo[]
}

GameDbo.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(GameStatus),
    allowNull: false,
  },
  board: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastUpdate: { // TODO - see if needed, sequelize already includes updatedAt
    type: DataTypes.DATE,
    allowNull: false
  },
  endReason: {
    type: DataTypes.STRING
  }
},
  options
);

GameDbo.belongsTo(PlayerDbo, { foreignKey: 'winner' }) // TODO - mark `allowNull: true`
GameDbo.belongsToMany(PlayerDbo, { through: 'PlayerGames' })