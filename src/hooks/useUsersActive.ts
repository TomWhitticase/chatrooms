import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import useAlertStore from "~/stores/alertStore";

interface IProps {
  socket: Socket;
}

export default function useUsersActive({ socket }: IProps) {
  interface IUserLastSeen {
    user: User;
    time: Date;
  }
  const [usersLastSeen, setUsersLastSeen] = useState<IUserLastSeen[]>([]);
  const { addAlert } = useAlertStore();

  const { data: session } = useSession();

  //socket stuff
  useEffect(() => {
    if (!socket) return;
    if (!session) return;
    socket.on("user-active", ({ user }: { user: User }) => {
      if (user.id !== session.user.id) addUserActive(user);
    });
  }, [socket, session]);

  //send user active event every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!session) return;
      console.log("sending user active event");
      socket.emit("user-active", {
        user: session.user,
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [session, socket]);

  const addUserActive = (user: User) => {
    setUsersLastSeen((prev) => {
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
      setUsersLastSeen((prev) => {
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
  const [prevUsersActive, setPrevUsersActive] = useState<IUserLastSeen[]>([]);
  useEffect(() => {
    if (usersLastSeen.length > prevUsersActive.length) {
      //find user that has joined
      const newUser = usersLastSeen.find((u) => {
        return !prevUsersActive.find((p) => p.user.id === u.user.id);
      });
      if (newUser) {
        addAlert({ type: "user-joined", user: newUser.user });
      }
    }
    if (usersLastSeen.length < prevUsersActive.length) {
      //find user that has left
      const newUser = prevUsersActive.find((u) => {
        return !usersLastSeen.find((p) => p.user.id === u.user.id);
      });
      if (newUser) {
        addAlert({ type: "user-left", user: newUser.user });
      }
    }
    setPrevUsersActive(usersLastSeen);
  }, [usersLastSeen]);

  return { usersActive: usersLastSeen.map((obj) => obj.user) };
}
