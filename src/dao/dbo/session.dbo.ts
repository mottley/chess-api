import { Model, DataTypes, Sequelize, InitOptions } from 'sequelize';
import { getOptions } from '../connection';

const options: InitOptions = getOptions('Session');

export class SessionDbo extends Model { }
