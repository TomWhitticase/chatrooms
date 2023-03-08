import { useSession } from "next-auth/react";
import useUsersOnlineStore from "~/stores/usersOnlineStore";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import useUsersActive from "~/hooks/useUsersActive";

let socket: Socket;

export function UsersOnlineController() {
  //states
  const { data: session, status } = useSession();
  const setUsersOnline = useUsersOnlineStore((state) => state.setUsersOnline);
  const { usersActive } = useUsersActive({ socket });

  const [pressedKey, setPressedKey] = useState<string | undefined>(undefined);

  //actions
  useEffect(() => {
    void (async () => {
      await fetch("/api/socket");
      socket = io();
      socket.on("connect", () => {
        console.log("connected to web socket server");
      });
      socket.on("disconnect", () => {
        console.log("disconnected from web socket server");
      });
    })();
  }, []);

  //detect pressing keys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setPressedKey(event.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  //update the store whenever the usersActive array changes
  useEffect(() => {
    console.log("usersOnline changed");
    setUsersOnline(usersActive);
  }, [pressedKey]);

  useEffect(() => {
    setUsersOnline(usersActive);
  }, [usersActive]);

  //views: no views this is just a controller function
  return <></>;
}
