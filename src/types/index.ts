import { Socket } from "socket.io";

export interface UserSocket extends Socket {
  nickname?: string;
}
