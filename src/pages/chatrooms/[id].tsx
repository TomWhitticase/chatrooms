import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";
import { api } from "~/utils/api";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { User } from "@prisma/client";
import { useUsersTyping } from "~/hooks/useUsersTyping";
import ReactLoading from "react-loading";
import Avatar from "~/components/Avatar";
import { FaUser } from "react-icons/fa";
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react";
import Loading from "react-loading";
import { ArrowBackIcon } from "@chakra-ui/icons";
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

  const [displayUsersOnline, setDisplayUsersOnline] = React.useState(false);
  const toggleDisplayUsersOnline = () => {
    setDisplayUsersOnline(!displayUsersOnline);
  };

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

  // Send chatroomId to the socket events
  const createMessage = api.message.create.useMutation({
    onSuccess: () => {
      socket.emit("update-messages", chatroomId); // Send chatroomId to the socket event
      void refetchMessages();
    },
  });
  const deleteMessage = api.message.delete.useMutation({
    onSuccess: () => {
      socket.emit("update-messages", chatroomId); // Send chatroomId to the socket event
    },
  });
  const sendMessageTypingEvent = () => {
    socket.emit("user-typing", { chatroomId, user: sessionData?.user }); // Send chatroomId to the socket event
  };
  const sendUserActiveEvent = () => {
    socket.emit("user-active", { chatroomId, user: sessionData?.user }); // Send chatroomId to the socket event
  };

  //is typing idicator
  const { usersTyping, addUserTyping, clearUsersTyping } = useUsersTyping(5000);
  //users active
  const { usersTyping: usersActive, addUserTyping: addUserActive } =
    useUsersTyping(5000);

  //socket stuff
  useEffect(() => void socketInitializer(), [sessionData?.user]);

  const socketInitializer = async () => {
    await fetch("/api/socket");
    socket = io();

    socket.on("connect", () => {
      console.log("connected");
    });

    // Add chatroomId as a parameter to the socket events
    socket.on("update-messages", (chatroomId: string) => {
      // Only refetch messages and clear usersTyping for the current chatroom
      if (chatroomId === chatroomId) {
        void refetchMessages();
        clearUsersTyping();
      }
    });
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
        if (
          userChatroomId === chatroomId &&
          user.id !== sessionData?.user?.id
        ) {
          addUserTyping(user);
        }
      }
    );
    socket.on("user-active", ({ chatroomId: userChatroomId, user }) => {
      // Only add user to usersActive for the current chatroom
      if (userChatroomId === chatroomId && user.id !== sessionData?.user?.id) {
        addUserActive(user);
      }
    });

    sendUserActiveEvent();
  };

  //scroll to bottom of chat when new message is added
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, usersTyping]);

  //broadcast user is active every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      sendUserActiveEvent();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (status === "loading") {
    return (
      <Flex className="h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-4">
        <Loading />
      </Flex>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Flex className="h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-4">
        <Heading>You must be logged in to view this page</Heading>
      </Flex>
    );
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
        <div className="flex h-[4rem] w-full items-center justify-between px-2">
          <Button
            onClick={() => {
              void router.push("/chatrooms");
            }}
          >
            <ArrowBackIcon />
          </Button>
          <div className="flex flex-col">
            <Heading size="lg" fontWeight={"semibold"}>
              {chatroom?.name}
            </Heading>
          </div>
          <Button
            colorScheme={displayUsersOnline ? "blue" : "gray"}
            onClick={toggleDisplayUsersOnline}
          >
            <FaUser className="mr-1" /> {usersActive.length}
          </Button>
        </div>
        <div className="flex">
          <div
            className="h-[calc(100vh-12rem)] flex-1 overflow-y-auto scroll-smooth p-2"
            ref={chatContainerRef}
          >
            <>
              <Box className="flex h-[calc(100vh-12rem)] flex-col items-center justify-end">
                Start of chat
                <Divider />
              </Box>
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
                            {message.content}
                            {/* if message is link to image, display image */}
                            {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
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
                            )}
                          </Box>
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
                    <Avatar user={user} />
                  </div>

                  <div className="">
                    <div // Display the message content and set the appropriate styling
                      className={`flex max-w-[20rem] gap-2 rounded-xl bg-slate-200 p-2 text-slate-800`}
                    >
                      <ReactLoading
                        type="bubbles"
                        color="#888"
                        width={15}
                        height={15}
                        delay={0}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </>
          </div>
          <Flex
            className="flex w-48 flex-col gap-2 p-2"
            hidden={!displayUsersOnline}
          >
            <Text>Online - {usersActive.length}</Text>
            {usersActive.length === 0 ? (
              <Flex justifyContent={"start"} alignItems={"center"} gap={2}>
                <Text>Nobody else is online</Text>
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
        </div>
      </div>

      <div className="h-[4rem]">
        <form
          className="flex gap-4 p-2"
          onSubmit={(e) => {
            //create new chatroom
            e.preventDefault();

            //clear inputs
            const newMessage = messageInput.trim();
            if (!newMessage) return;

            void createMessage.mutate({
              chatroomId: chatroomId?.toString() ?? "",
              content: newMessage,
            });

            setMessageInput("");
          }}
        >
          <Input
            type="text"
            placeholder="Type your message here..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") return;
              sendMessageTypingEvent();
            }}
          />

          <Button colorScheme={"blue"} type="submit">
            Send
          </Button>
        </form>
      </div>
    </>
  );
};
