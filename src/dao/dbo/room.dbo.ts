import { InitOptions, Model, DataTypes, HasManyGetAssociationsMixin, HasManyAddAssociationMixin, Association, Optional } from 'sequelize';
import { getOptions } from '../connection';
import { PlayerDbo } from './player.dbo';

interface RoomAttributes {
  id: string
  name: string
}

interface RoomCreationAttributes extends Optional<RoomAttributes, 'id'> { }

const options: InitOptions = getOptions('Room');

export class RoomDbo extends Model<RoomAttributes, RoomCreationAttributes> implements RoomAttributes {
  public id!: string
  public name!: string

  public getPlayers!: HasManyGetAssociationsMixin<PlayerDbo>;
  public addPlayer!: HasManyAddAssociationMixin<RoomDbo, PlayerDbo>;

  public readonly players?: PlayerDbo[]

  public static associations: {
    players: Association<RoomDbo, PlayerDbo>;
  };
}

RoomDbo.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
},
  options
)

RoomDbo.belongsToMany(PlayerDbo, { through: 'PlayerRooms' })


