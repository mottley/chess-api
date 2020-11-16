import { Model, DataTypes, Sequelize, InitOptions, Optional } from 'sequelize';
import { GameDbo } from './game.dbo';
import { PlayerDbo } from './player.dbo';
import { getOptions } from '../connection';

interface MoveAttributes {
  id: string,
  move: string,
  game: GameDbo,
  player: PlayerDbo,

  gameId?: string
}

interface MoveCreationAttributes extends Optional<MoveAttributes, 'id' | 'game' | 'player'> {
  gameId: string,
  playerId: string
}

const options: InitOptions = getOptions('Move');

export class MoveDbo extends Model<MoveAttributes, MoveCreationAttributes> implements MoveAttributes {
  public id!: string
  public move!: string
  public game!: GameDbo
  public player!: PlayerDbo

  public readonly createdAt!: Date;
}

MoveDbo.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  move: {
    type: DataTypes.STRING,
    allowNull: false
  }
},
  options
);

MoveDbo.belongsTo(GameDbo, { as: 'game', foreignKey: 'gameId' });
MoveDbo.belongsTo(PlayerDbo, { as: 'player', foreignKey: 'playerId' });

options.sequelize.sync()