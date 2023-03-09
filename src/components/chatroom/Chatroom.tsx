import type { Chatroom, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { ChatContainer } from "~/components/chatroom/ChatContainer";
import { api } from "~/utils/api";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { AiOutlineMenu } from "react-icons/ai";
import router from "next/router";
import { ChatroomList } from "./ChatroomList";
import { LoadingScreen } from "../LoadingScreen";
import { ChatroomUsers } from "./ChatroomUsers";
let socket: Socket;

export function Chatroom() {
  const { data: session, status: sessionStatus } = useSession();

  const { data: chatrooms, status: chatroomsStatus } =
    api.chatroom.getMemberOf.useQuery(undefined, {
      enabled: session?.user !== undefined,
    });

  const [selectedChatroom, setSelectedChatroom] = useState<
    Chatroom & {
      members: User[];
    }
  >();

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

  useEffect(() => {
    if (session && socket) {
      console.log("telling the web socket server that i have joined");
      socket.emit("user-joined", { user: session.user, socketId: socket.id });
    }
  }, [session]);

  const [chatroomListOpen, setChatroomListOpen] = useState(true);

  if (chatroomsStatus === "loading") {
    return <LoadingScreen />;
  }

  if (sessionStatus === "unauthenticated") {
    //redirect to index page if not authenticated
    void router.push("/");
    return <LoadingScreen />;
  }

  return (
    <div className="relative flex h-[calc(100vh-4rem)]">
      <button
        className="absolute top-2 left-2 p-2"
        onClick={() => {
          console.log("clicked");
          setChatroomListOpen(true);
        }}
      >
        <AiOutlineMenu />
      </button>

      <div className={` z-[10] border-r-2 bg-white`} hidden={!chatroomListOpen}>
        <button
          onClick={() => setChatroomListOpen(!chatroomListOpen)}
          className="p-2"
        >
          <AiOutlineArrowLeft />
        </button>

        <ChatroomList
          selectedChatroom={selectedChatroom}
          chatrooms={chatrooms}
          setSelectedChatroom={setSelectedChatroom}
        />
      </div>
      <div className="flex flex-1">
        {selectedChatroom ? (
          <ChatContainer chatroom={selectedChatroom} socket={socket} />
        ) : (
          <div className="flex w-full items-center justify-center">
            select a chatroom
          </div>
        )}
      </div>
      <div className="flex flex-col items-start justify-center">
        <ChatroomUsers members={selectedChatroom?.members} />
      </div>
    </div>
  );
}
