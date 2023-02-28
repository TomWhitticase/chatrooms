/* eslint-disable */
import { Server } from "socket.io";
import { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";

//Socket for handling users online

const SocketHandler = (req: NextApiRequest, res: any) => {
  if (res.socket.server) {
    if (res.socket.server.io) {
      console.log("Socket is already running");
    } else {
      console.log("Socket is initializing");
      const io = new Server(res.socket.server);
      res.socket.server.io = io;

      io.on("connection", (socket) => {
        socket.on("user-active", (msg) => {
          socket.broadcast.emit("user-active", msg);
        });
      });
    }
  }
  res.end();
};

export default SocketHandler;
