import { Model, DataTypes, InitOptions, Optional } from 'sequelize';
import { GameStatus, Color, GameResult } from '../../model/enum';
import { getOptions } from '../connection';
import { PlayerDbo } from './player.dbo';

interface GameAttributes {
  id: string,
  status: GameStatus,
  board: string,
  winner: PlayerDbo,
  result: GameResult,
  white: PlayerDbo,
  black: PlayerDbo,
  turn: Color,
  winnerId?: string
}


interface GameCreationAttributes extends Optional<GameAttributes, 'id' | 'winner' | 'result' | 'white' | 'black'> {
  whitePlayerId: string,
  blackPlayerId: string
}

const options: InitOptions = getOptions('Game');

export class GameDbo extends Model<GameAttributes, GameCreationAttributes> implements GameAttributes {
  public id!: string
  public status!: GameStatus
  public board!: string
  public winner!: PlayerDbo

  public result!: GameResult

  public white!: PlayerDbo
  public black!: PlayerDbo

  public turn!: Color

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
  turn: {
    type: DataTypes.ENUM,
    values: Object.values(Color),
    allowNull: false
  },
  result: {
    type: DataTypes.ENUM,
    values: Object.values(GameResult)
  }
},
  options
);

GameDbo.belongsTo(PlayerDbo, { as: 'winner', foreignKey: 'winnerId' }) // TODO - mark `allowNull: true`
GameDbo.belongsTo(PlayerDbo, { as: 'white', foreignKey: 'whitePlayerId' })
GameDbo.belongsTo(PlayerDbo, { as: 'black', foreignKey: 'blackPlayerId' })

// options.sequelize.sync({ force: true })