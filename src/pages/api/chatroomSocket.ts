/* eslint-disable */
import { Server } from "socket.io";
import { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";

const SocketHandler = (req: NextApiRequest, res: any) => {
  if (res.socket.server) {
    if (res.socket.server.io) {
      console.log("Socket is already running");
    } else {
      console.log("Socket is initializing");
      const io = new Server(res.socket.server);
      res.socket.server.io = io;

      io.on("connection", (socket) => {
        socket.on("update-messages", (msg) => {
          socket.broadcast.emit("update-messages", msg);
        });
        socket.on("user-typing", (user: User) => {
          socket.broadcast.emit("user-typing", user);
        });
      });
    }
  }
  res.end();
};

export default SocketHandler;
/*
//js version of the above
import { Server } from "Socket.IO";

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      socket.on("update-messages", (msg) => {
        socket.broadcast.emit("update-messages", msg);
      });
      socket.on("user-typing", (msg) => {
        socket.broadcast.emit("user-typing", msg);
      });
    });
  }
  res.end();
};

export default SocketHandler;
*/
