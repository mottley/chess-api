import { Player } from './player';
import { RoomStatus } from './enum';

export class Room {
  constructor(
    public id: string,
    public name: string,
    public status: RoomStatus,
    public players: Player[],
    public gameId?: string,
  ) { }
}