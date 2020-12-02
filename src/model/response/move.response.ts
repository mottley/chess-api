import { Color } from '../../model/enum';


export interface MoveResponse {
  move: string
  username: string
  color: Color
  time: Date
}