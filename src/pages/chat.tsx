import { Button } from "@chakra-ui/react";
import type { Chatroom } from "@prisma/client";
import type { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import Avatar from "~/components/Avatar";
import { ChatContainer } from "~/components/ChatContainer";
import useUsersActive from "~/hooks/useUsersActive";
import { api } from "~/utils/api";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { AiOutlineArrowRight } from "react-icons/ai";
import { AiOutlineMenu } from "react-icons/ai";
import { FaUsers } from "react-icons/fa";
let socket: Socket;

export default function Chat() {
  const { data: session } = useSession();

  const { usersActive } = useUsersActive({ socket });

  const { data: chatrooms } = api.chatroom.getAll.useQuery(undefined, {
    enabled: session?.user !== undefined,
  });

  const [selectedChatroom, setSelectedChatroom] = useState<
    Chatroom | undefined
  >();

  useEffect(() => {
    void (async () => {
      await fetch("/api/socket");
      socket = io();
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
  const [chatroomUsersOpen, setChatroomUsersOpen] = useState(true);

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
      <button
        className="absolute top-2 right-2 p-2"
        onClick={() => {
          setChatroomUsersOpen(true);
        }}
      >
        <FaUsers />
      </button>
      <div
        className={`left-0 top-0 bottom-0 z-[10] border-r-2 bg-white mobile-only:fixed`}
        hidden={!chatroomListOpen}
      >
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
      <div
        className={`right-0 top-0 bottom-0 z-[10] border-l-2 bg-white mobile-only:fixed`}
        hidden={!chatroomUsersOpen}
      >
        <div className="flex justify-end">
          <button
            onClick={() => setChatroomUsersOpen(!chatroomUsersOpen)}
            className="p-2"
          >
            <AiOutlineArrowRight />
          </button>
        </div>
        <ChatroomUsers usersActive={usersActive} />
      </div>
    </div>
  );
}

function ChatroomUsers({ usersActive }: { usersActive: User[] }) {
  const { data: session } = useSession();
  return (
    <div className="flex w-full flex-col items-start justify-start">
      {session && (
        <div className="flex items-center justify-start gap-2 p-2">
          <Avatar user={session.user} />
          {session.user.name}
        </div>
      )}
      {usersActive &&
        usersActive.map((user, i) => (
          <div className="flex items-center justify-start gap-2 p-2" key={i}>
            <Avatar user={user} />
            {user.name}
          </div>
        ))}
    </div>
  );
}

function ChatroomList({
  chatrooms,
  setSelectedChatroom,
  selectedChatroom,
}: {
  chatrooms: Chatroom[] | undefined;
  selectedChatroom: Chatroom | undefined;
  setSelectedChatroom: (chatroom: Chatroom | undefined) => void;
}) {
  return (
    <div className="flex flex-col gap-2 p-2">
      {chatrooms &&
        chatrooms.map((chatroom, i) => (
          <Button
            className="border-b-2 p-4 "
            key={i}
            colorScheme={selectedChatroom?.id === chatroom.id ? "blue" : "gray"}
            onClick={() => setSelectedChatroom(chatroom)}
          >
            {chatroom.name}
          </Button>
        ))}
    </div>
  );
}
