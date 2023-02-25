import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
let socket: Socket;

const Chatroom: NextPage = () => {
  return (
    <div>
      <Messages />
    </div>
  );
};
export default Chatroom;

const Messages: React.FC = () => {
  const router = useRouter();
  const { id: chatroomId } = router.query;
  const { data: sessionData, status } = useSession();

  const [messageInput, setMessageInput] = React.useState("");

  const { data: messages, refetch: refetchMessages } =
    api.message.getAll.useQuery(
      { chatroomId: chatroomId?.toString() ?? "" },
      {
        enabled: sessionData?.user !== undefined,
      }
    );
  const { data: chatroom } = api.chatroom.getRoom.useQuery({
    id: chatroomId?.toString() ?? "",
  });

  const createMessage = api.message.create.useMutation({
    onSuccess: () => {
      socket.emit("update-messages", "yay!");
      refetchMessages();
    },
  });
  const deleteMessage = api.message.delete.useMutation({
    onSuccess: () => {
      socket.emit("update-messages", "yay!");
    },
  });

  //is typing idicator
  const [isTypingText, setIsTypingText] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsTypingText("");
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isTypingText]);

  //socket stuff
  useEffect(() => void socketInitializer(), []);

  const socketInitializer = async () => {
    await fetch("/api/socket");
    socket = io();

    socket.on("connect", () => {
      console.log("connected");
    });

    socket.on("update-messages", () => {
      void refetchMessages();
      console.log("socket message recieved");
    });
    socket.on("user-typing", (msg: string) => {
      setIsTypingText(msg);
    });
  };

  //scroll to bottom of chat when new message is added
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return <p>You must be logged in</p>;
  }
  return (
    <div>
      <div>
        <h1>Chatroom Name: {chatroom?.name}</h1>
      </div>

      <div
        className="h-96  overflow-y-auto scroll-smooth"
        ref={chatContainerRef}
      >
        <div className="flex h-96 items-end justify-center border-b-2 border-b-slate-500">
          Start of chat
        </div>
        {messages?.map((message) => (
          <div
            key={message.id}
            className="flex w-full flex-col items-center justify-between gap-4"
          >
            <div className="flex w-full flex-row justify-between">
              <div className="flex w-full flex-row items-center justify-start gap-4">
                <Image
                  className="rounded-full"
                  width={40}
                  height={40}
                  src={message.sender.image || ""}
                  alt={message.sender.name || ""}
                />
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold">{message.sender.name}</h2>
                  <p className="text-2xl">{message.content}</p>
                </div>
              </div>
              <button
                className="btn"
                onClick={() => {
                  void deleteMessage.mutate(
                    { id: message.id },
                    {
                      onSuccess: () => {
                        void refetchMessages();
                      },
                    }
                  );
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <pre>{isTypingText || " "} </pre>
      <form
        className="flex gap-4 p-4"
        onSubmit={(e) => {
          //create new chatroom
          e.preventDefault();

          //clear inputs
          setMessageInput("");

          void createMessage.mutate({
            chatroomId: chatroomId?.toString() ?? "",
            content: messageInput,
          });
        }}
      >
        <input
          type="text"
          className="input-bordered input w-full border-2"
          placeholder="Type your message here..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={() => {
            socket.emit(
              "user-typing",
              `${sessionData?.user.name || ""} is typing...`
            );
          }}
        />

        <button className="rounded bg-blue-500 px-2 text-white" type="submit">
          Send
        </button>
      </form>
    </div>
  );
};
