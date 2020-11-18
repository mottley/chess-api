import { Color } from '../../model/enum';


export interface MoveResponse {
  move: string
  player: string
  color: Color
  time: Date
}