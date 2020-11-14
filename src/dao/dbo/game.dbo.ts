import { Model, DataTypes, InitOptions, Optional, HasManyAddAssociationMixin, Association, HasManyGetAssociationsMixin } from 'sequelize';
import { GameStatus, Color } from '../../model/enum';
import { getOptions } from '../connection';
import { PlayerDbo } from './player.dbo';

// TODO - Keep track of turn
interface GameAttributes {
  id: string,
  status: GameStatus,
  board: string,
  winner: PlayerDbo,
  result: string, // TODO - enum
  white: PlayerDbo,
  black: PlayerDbo,
  turn: Color
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

  public result!: string

  public white!: PlayerDbo
  public black!: PlayerDbo

  public turn!: Color

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // public getPlayers!: HasManyGetAssociationsMixin<PlayerDbo>;
  // public addPlayer!: HasManyAddAssociationMixin<GameDbo, PlayerDbo>;

  // public readonly players?: PlayerDbo[]

  // public static associations: {
  //   players: Association<GameDbo, PlayerDbo>;
  // };
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
    type: DataTypes.STRING
  }
},
  options
);

// GameDbo.belongsTo(PlayerDbo, { foreignKey: 'winner' }) // TODO - mark `allowNull: true`
// GameDbo.belongsToMany(PlayerDbo, { through: 'PlayerGames' })
// GameDbo.belongsTo(PlayerDbo, { foreignKey: 'winner' }) // TODO - mark `allowNull: true`
GameDbo.belongsTo(PlayerDbo, { as: 'white', foreignKey: 'whitePlayerId' })
GameDbo.belongsTo(PlayerDbo, { as: 'black', foreignKey: 'blackPlayerId' })

// options.sequelize.sync({ force: true })