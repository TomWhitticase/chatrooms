import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { Message, User } from "@prisma/client";
import { useUsersTyping } from "~/hooks/useUsersTyping";
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
      void refetchMessages();
    },
  });
  const deleteMessage = api.message.delete.useMutation({
    onSuccess: () => {
      void socket.emit("update-messages", "yay!");
    },
  });

  //is typing idicator
  const { usersTyping, addUserTyping, clearUsersTyping } = useUsersTyping();

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
      clearUsersTyping();
    });
    socket.on("user-typing", (user: User) => {
      addUserTyping(user);
    });
  };

  //scroll to bottom of chat when new message is added
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, usersTyping]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return <p>You must be logged in</p>;
  }
  // const handleDeleteMessage = (id: string) => {
  //   void deleteMessage.mutate(
  //     { id: id },
  //     {
  //       onSuccess: () => {
  //         void refetchMessages();
  //       },
  //     }
  //   );
  // };
  return (
    <>
      <div className="relative">
        <div className="flex h-[4rem] w-full justify-between">
          <button
            onClick={() => {
              void router.push("/chatrooms");
            }}
            className="p-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </button>
          <h1 className="p-2 text-2xl">Chatroom Name: {chatroom?.name}</h1>
        </div>

        <div
          className="h-[calc(100vh-12rem)] overflow-y-auto scroll-smooth pb-2"
          ref={chatContainerRef}
        >
          <>
            <div className="flex h-[calc(100vh-12rem)] items-end justify-center border-b-2 border-b-slate-500">
              Start of chat
            </div>
            {messages // Iterate over each message and sort by sentAt time
              ?.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime())
              .map((message, i, arr) => {
                // Get the previous and next messages in the array
                const lastMessage = arr[i - 1];
                const nextMessage = arr[i + 1];

                // Determine whether to show the date for this message and the next message
                const showMessageDate =
                  !lastMessage ||
                  lastMessage.senderId !== message.senderId ||
                  (message.sentAt.getTime() - lastMessage.sentAt.getTime()) /
                    1000 >
                    60;
                const showNextMessageDate =
                  !nextMessage ||
                  nextMessage.senderId !== message.senderId ||
                  (nextMessage.sentAt.getTime() - message.sentAt.getTime()) /
                    1000 >
                    60;

                return (
                  <div
                    key={i}
                    className={`flex w-full ${
                      message.senderId === sessionData?.user.id
                        ? "flex-row-reverse"
                        : ""
                    } gap-2 p-[0.1rem]`}
                  >
                    <div className="align-stretch flex items-end justify-center">
                      {showNextMessageDate ? ( // If the next message shows the date, display the sender's profile image
                        <Image
                          className="rounded-full"
                          src={message.sender.image ?? ""}
                          alt={message.sender.name ?? ""}
                          width={30}
                          height={30}
                        />
                      ) : (
                        <div className="w-[30px]"> </div> // Otherwise, display an empty div
                      )}
                    </div>

                    <div>
                      {showMessageDate && ( // If this message shows the date, display the date and time
                        <p
                          className={`p-2 text-xs ${
                            message.senderId === sessionData?.user.id
                              ? "text-right"
                              : "text-left"
                          } `}
                        >
                          {message.sentAt.toLocaleString().slice(0, 17)}
                        </p>
                      )}
                      <div // Display the message content and set the appropriate styling
                        className={`max-w-[20rem] rounded-sm p-2 ${
                          message.senderId === sessionData?.user.id
                            ? "rounded-l-xl"
                            : "rounded-r-xl"
                        } ${
                          message.senderId === sessionData?.user.id
                            ? `${showMessageDate ? `rounded-tr-xl` : ``} ${
                                showNextMessageDate ? `rounded-br-xl` : ``
                              } bg-blue-500 text-white`
                            : `${showMessageDate ? `rounded-tl-xl` : ``} ${
                                showNextMessageDate ? `rounded-bl-xl` : ``
                              } bg-slate-200 text-slate-800`
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            {usersTyping.map(({ user, time }) => (
              <div
                key={time.toString()}
                className={`flex w-full gap-2 p-[0.1rem]`}
              >
                <div className="align-stretch flex items-end justify-center">
                  <Image
                    className="rounded-full"
                    src={user.image ?? ""}
                    alt={user.name ?? ""}
                    width={30}
                    height={30}
                  />
                </div>

                <div className="">
                  <div // Display the message content and set the appropriate styling
                    className={`max-w-[20rem] rounded-xl bg-slate-200 p-2 text-slate-800`}
                  >
                    typing...
                  </div>
                </div>
              </div>
            ))}
          </>
        </div>
      </div>

      <div className="h-[4rem]">
        <form
          className="flex gap-4 border-t-2 p-2"
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
            className="w-full rounded-xl border-2 p-2"
            placeholder="Type your message here..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") return;
              socket.emit("user-typing", sessionData?.user);
            }}
          />

          <button className="rounded bg-blue-500 px-2 text-white" type="submit">
            Send
          </button>
        </form>
      </div>
    </>
  );
};
