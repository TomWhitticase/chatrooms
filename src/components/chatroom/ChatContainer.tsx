import { Box, Divider } from "@chakra-ui/react";
import type { Chatroom, Message } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { useUsersTyping } from "~/hooks/useUsersTyping";
import { api } from "~/utils/api";

import Avatar from "../user/Avatar";
import MessageInput from "./MessageInput";

interface IProps {
  chatroom: Chatroom | undefined;
  socket: Socket;
}
export function ChatContainer({ chatroom, socket }: IProps) {
  //session data
  const { data: sessionData } = useSession();

  const { usersTyping, clearUsersTyping } = useUsersTyping({
    socket,
    chatroomId: chatroom?.id,
  });

  const { data: messages, refetch: refetchMessages } =
    api.message.getAll.useQuery(
      { chatroomId: chatroom?.id ?? "" },
      {
        enabled: chatroom !== undefined,
      }
    );
  const createMessage = api.message.create.useMutation({
    onSuccess: () => {
      socket.emit("update-messages", chatroom?.id || ""); // Send chatroomId to the socket event
      void refetchMessages();
    },
  });

  //scroll to bottom of chat when new message is added
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    socket.on("update-messages", (chatroomId: string) => {
      // Only refetch messages and clear usersTyping for the current chatroom
      if (chatroomId === chatroom?.id) {
        void refetchMessages();
        clearUsersTyping();
      }
    });
  }, [socket, chatroom]);

  //send message
  const handleSendMessage = (message: string) => {
    void createMessage.mutate({
      chatroomId: chatroom?.id ?? "",
      content: message,
    });
  };

  const sendMessageTypingEvent = () => {
    socket.emit("user-typing", {
      chatroomId: chatroom?.id || "",
      user: sessionData?.user,
    });
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div
        className="flex-1 overflow-y-auto scroll-smooth p-2"
        ref={chatContainerRef}
      >
        <>
          <Box className="flex h-full flex-col items-center justify-end">
            Start of chat
            <Divider />
          </Box>
          {messages // Iterate over each message and sort by sentAt time
            ?.sort(
              (a: Message, b: Message) =>
                a.sentAt.getTime() - b.sentAt.getTime()
            )
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
                      <Avatar user={message.sender} />
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
                    <div
                      className={`flex w-full items-end ${
                        message.senderId === sessionData?.user.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <Box // Display the message content and set the appropriate styling
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
                        {/* //if message.content contains the url of an image then
                        display the Image */}
                        {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
                          message.content
                        ) ? (
                          <Image
                            className="cursor-pointer"
                            src={(() => {
                              //message.content contains a url but also other text. get just the url

                              function extractImageUrls(str: string): string[] {
                                const regex =
                                  /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))/gi; // Regular expression to match image URLs
                                const matches = str.match(regex); // Find all matches in the string
                                return matches || []; // Return array of matches or empty array if none found
                              }
                              return extractImageUrls(message.content)[0] || "";
                            })()}
                            alt={message.content}
                            width={250}
                            height={250}
                            onClick={() => {
                              window.open(message.content, "_blank");
                            }}
                          />
                        ) : (
                          message.content
                        )}
                        {/* if message is link to image, display image */}
                        {/* {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
                          message.content
                        ) && (
                          <Image
                            className="cursor-pointer"
                            src={message.content}
                            alt={message.content}
                            width={250}
                            height={250}
                            onClick={() => {
                              window.open(message.content, "_blank");
                            }}
                          />
                        )} */}
                      </Box>
                    </div>
                  </div>
                </div>
              );
            })}
        </>
      </div>
      <MessageInput
        usersTyping={usersTyping}
        handleSendMessage={handleSendMessage}
        sendMessageTypingEvent={sendMessageTypingEvent}
      />
    </div>
  );
}
