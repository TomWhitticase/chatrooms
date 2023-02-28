import { Flex, Text } from "@chakra-ui/react";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Avatar from "./Avatar";
let socket: Socket;

export function UsersContainer() {
  const { data: sessionData } = useSession();
  const [usersActive, setUsersActive] = useState<{ user: User; time: Date }[]>(
    []
  );

  //socket stuff
  useEffect(() => {
    void socketInitializer();
  }, [sessionData]);

  const socketInitializer = async () => {
    // If there is no session data, don't initialize the socket
    if (!sessionData) return;

    await fetch("/api/usersSocket");
    socket = io();

    socket.on("connect", () => {
      console.log("connected");
    });

    socket.on("user-active", ({ user, time }: { user: User; time: Date }) => {
      console.log(user.name, " is active");
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionData) {
        console.log("sending user active event");
        socket.emit("user-active", {
          user: sessionData.user,
          time: new Date(),
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionData, socket]);

  return (
    <Flex className="flex w-48 flex-col gap-2 p-2">
      <Text>Online - {usersActive.length}</Text>
      {usersActive.length === 0 ? (
        <Flex justifyContent={"start"} alignItems={"center"} gap={2}>
          <Text>Nobody is online</Text>
        </Flex>
      ) : (
        usersActive.map(({ user, time }) => (
          <Flex
            key={time.toString()}
            justifyContent={"start"}
            alignItems={"center"}
            gap={2}
          >
            <Avatar user={user} />
            <Text>{user.name}</Text>
          </Flex>
        ))
      )}
    </Flex>
  );
}
