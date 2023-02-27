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
import { ChatContainer } from "~/components/ChatContainer";
import { UsersContainer } from "~/components/UsersContainer";
import MessageInput from "~/components/MessageInput";
import { Session } from "next-auth";
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

  const [displayUsersOnline, setDisplayUsersOnline] = React.useState(false);
  const toggleDisplayUsersOnline = () => {
    setDisplayUsersOnline(!displayUsersOnline);
  };

  //send message
  const handleSendMessage = (message: string) => {
    void createMessage.mutate({
      chatroomId: chatroomId?.toString() ?? "",
      content: message,
    });
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
  function sendUserActiveEvent() {
    console.log(
      "sending user active event: ",
      sessionData?.user?.name,
      " status: ",
      status
    );
    socket.emit("user-active", { chatroomId, user: sessionData?.user }); // Send chatroomId to the socket event
  }

  //is typing idicator
  const { usersTyping, addUserTyping, clearUsersTyping } = useUsersTyping(5000);
  //users active
  const { usersTyping: usersActive, addUserTyping: addUserActive } =
    useUsersTyping(5000);

  //socket stuff
  useEffect(() => {
    console.log("initialising socket with user: ", sessionData?.user?.name);
    void socketInitializer();
  }, [sessionData, chatroomId]);

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
    socket.on(
      "user-active",
      ({
        chatroomId: userChatroomId,
        user,
      }: {
        chatroomId: string;
        user: User;
      }) => {
        // Only add user to usersActive for the current chatroom
        if (!user || !userChatroomId || !sessionData?.user) return;
        if (
          userChatroomId === chatroomId &&
          user.id !== sessionData?.user?.id
        ) {
          addUserActive(user);
        }
      }
    );

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
  }, [sessionData]);

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
          <ChatContainer messages={messages} usersTyping={usersTyping} />
          {displayUsersOnline && <UsersContainer usersActive={usersActive} />}
        </div>
      </div>

      <MessageInput
        handleSendMessage={handleSendMessage}
        sendMessageTypingEvent={sendMessageTypingEvent}
      />
    </>
  );
};
