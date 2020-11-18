import { Player } from './player';

export class Room {
  constructor(
    public id: string,
    public name: string,
    public players: Player[]
  ) { }
}