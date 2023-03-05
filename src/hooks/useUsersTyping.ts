import type { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import type { Socket } from "socket.io-client";

export function useUsersTyping({
  socket,
  chatroomId,
}: {
  socket: Socket;
  chatroomId: string | undefined;
}) {
  const timeout = 5000;
  interface IUserTyping {
    user: User;
    time: Date;
  }
  const [usersTyping, setUsersTyping] = useState<IUserTyping[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    clearUsersTyping();
    if (!socket) return;
    socket.on(
      "user-typing",
      ({
        chatroomId: userChatroomId,
        user,
      }: {
        chatroomId: string;
        user: User;
      }) => {
        // Only add user to usersTyping for the current chatroom
        if (userChatroomId === chatroomId && user.id !== session?.user?.id) {
          console.log(userChatroomId, " ; ", chatroomId);
          addUserTyping({ user });
        }
      }
    );
    return () => {
      socket.off("user-typing");
    };
  }, [socket, chatroomId, session]);

  const addUserTyping = ({ user }: { user: User }) => {
    //add to array
    setUsersTyping((prev) => {
      const userTyping = prev.find((u) => u.user.id === user.id);
      if (userTyping) {
        return prev.map((u) => {
          if (u.user.id === user.id) {
            return { user, time: new Date() };
          }
          return u;
        });
      }
      return [...prev, { user, time: new Date() }];
    });
  };

  useEffect(() => {
    if (usersTyping.length > 0) {
      const intervalId = setInterval(() => {
        setUsersTyping((prev) => {
          return prev.filter((u) => {
            const timeDiff = new Date().getTime() - u.time.getTime();
            return timeDiff < timeout;
          });
        });
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [usersTyping]);

  const clearUsersTyping = () => {
    setUsersTyping([]);
  };

  return { usersTyping, clearUsersTyping };
}
