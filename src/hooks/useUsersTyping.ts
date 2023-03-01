import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export function useUsersTyping(timeout: number) {
  interface IUserTyping {
    user: User;
    time: Date;
    message: string;
  }
  const [usersTyping, setUsersTyping] = useState<IUserTyping[]>([]);

  const addUserTyping = ({
    user,
    message,
  }: {
    user: User;
    message: string;
  }) => {
    //add to array
    setUsersTyping((prev) => {
      const userTyping = prev.find((u) => u.user.id === user.id);
      if (userTyping) {
        return prev.map((u) => {
          if (u.user.id === user.id) {
            return { user, time: new Date(), message };
          }
          return u;
        });
      }
      return [...prev, { user, time: new Date(), message }];
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

  return { usersTyping, addUserTyping, clearUsersTyping };
}
