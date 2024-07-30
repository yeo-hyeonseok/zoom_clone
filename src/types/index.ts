import { WebSocket } from "ws";

export interface Message {
  type: string;
  payload: string;
}

export interface UserSocket extends WebSocket {
  nickname: string;
}
