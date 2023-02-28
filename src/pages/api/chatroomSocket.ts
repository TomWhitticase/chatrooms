/* eslint-disable */
import { Server } from "socket.io";
import { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";

//Socket for handling sending messages and users typing within a chatroom

const SocketHandler = (req: NextApiRequest, res: any) => {
  if (res.socket.server) {
    if (res.socket.server.io) {
      console.log("Socket is already running");
    } else {
      console.log("Socket is initializing");
      const io = new Server(res.socket.server);
      res.socket.server.io = io;

      io.on("connection", (socket) => {
        //when a users sends a message boradcast to all clients to make them refetch
        socket.on("update-messages", (msg) => {
          socket.broadcast.emit("update-messages", msg);
        });
        //when a user starts typing broadcast to all clients so they can update their UI
        socket.on("user-typing", (user: User) => {
          socket.broadcast.emit("user-typing", user);
        });
      });
    }
  }
  res.end();
};

export default SocketHandler;
