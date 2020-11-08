import { Model, DataTypes, InitOptions, Optional, HasManyAddAssociationMixin, Association, HasManyGetAssociationsMixin } from 'sequelize';
import { GameStatus } from '../../model/enum';
import { getOptions } from '../connection';
import { Game } from '../../model/game';
import { PlayerDbo } from './player.dbo';

// TODO - Keep track of turn
interface GameAttributes {
  id: string,
  status: GameStatus,
  board: string,
  winner: PlayerDbo,
  result: string // TODO - enum
}

interface GameCreationAttributes extends Optional<GameAttributes, 'id' | 'winner' | 'result'> { }

const options: InitOptions = getOptions('Game');

export class GameDbo extends Model<GameAttributes, GameCreationAttributes> implements GameAttributes {
  public id!: string
  public status!: GameStatus
  public board!: string
  public winner!: PlayerDbo

  public result!: string

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getPlayers!: HasManyGetAssociationsMixin<PlayerDbo>;
  public addPlayer!: HasManyAddAssociationMixin<GameDbo, PlayerDbo>;

  public readonly players?: PlayerDbo[]

  public static associations: {
    players: Association<GameDbo, PlayerDbo>;
  };
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
  result: {
    type: DataTypes.STRING
  }
},
  options
);

GameDbo.belongsTo(PlayerDbo, { foreignKey: 'winner' }) // TODO - mark `allowNull: true`
GameDbo.belongsToMany(PlayerDbo, { through: 'PlayerGames' })

options.sequelize.sync()