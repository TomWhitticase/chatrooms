import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import useAlertStore from "~/stores/alertStore";
let socket: Socket;

export default function useUsersActive() {
  interface IUserActive {
    user: User;
    time: Date;
  }
  const [usersActive, setUsersActive] = useState<IUserActive[]>([]);
  const { addAlert } = useAlertStore();

  const { data: sessionData } = useSession();

  //socket stuff
  useEffect(() => {
    void socketInitializer();
  }, [sessionData]);

  const socketInitializer = async () => {
    // If there is no session data, don't initialize the socket
    if (!sessionData) return;

    await fetch("/api/socket");
    socket = io();

    socket.on("connect", () => {
      console.log("connected f");
    });

    socket.on("user-active", ({ user }: { user: User }) => {
      if (user.id !== sessionData.user.id) addUserActive(user);
    });
  };

  //send user active event every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionData) {
        console.log("sending user active event");
        socket.emit("user-active", {
          user: sessionData.user,
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionData, socket]);

  const addUserActive = (user: User) => {
    setUsersActive((prev) => {
      const userActiveIndex = prev.findIndex((u) => u.user.id === user.id);
      if (userActiveIndex !== -1) {
        const newUserActive = { user, time: new Date() };
        prev[userActiveIndex] = newUserActive;
        return [...prev];
      }
      const newUserActive = { user, time: new Date() };
      return [...prev, newUserActive];
    });
  };

  //remove users that have been inactive for more than 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setUsersActive((prev) => {
        const currentTime = new Date();
        return prev.filter((u) => {
          const timeDiff = currentTime.getTime() - u.time.getTime();
          return timeDiff < 6000;
        });
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  //if a user has joined then console log
  const [prevUsersActive, setPrevUsersActive] = useState<IUserActive[]>([]);
  useEffect(() => {
    if (usersActive.length > prevUsersActive.length) {
      //find user that has joined
      const newUser = usersActive.find((u) => {
        return !prevUsersActive.find((p) => p.user.id === u.user.id);
      });
      if (newUser) {
        addAlert({ type: "user-joined", user: newUser.user });
      }
    }
    if (usersActive.length < prevUsersActive.length) {
      //find user that has left
      const newUser = prevUsersActive.find((u) => {
        return !usersActive.find((p) => p.user.id === u.user.id);
      });
      if (newUser) {
        addAlert({ type: "user-left", user: newUser.user });
      }
    }
    setPrevUsersActive(usersActive);
  }, [usersActive]);

  return { usersActive, addUserActive };
}
