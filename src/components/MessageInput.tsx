import { Button, Flex, Input, Text } from "@chakra-ui/react";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState } from "react";

import ReactLoading from "react-loading";

interface IProps {
  handleSendMessage: (message: string) => void;
  sendMessageTypingEvent: (message: string) => void;
  usersTyping: { user: User; time: Date; message: string }[];
}
export default function MessageInput({
  handleSendMessage,
  sendMessageTypingEvent,
  usersTyping,
}: IProps) {
  const [messageInput, setMessageInput] = useState("");
  const [errorText, setErrorText] = useState("");
  const { data: sessionData } = useSession();
  return (
    <div className="h-[8rem] p-4">
      <form
        onSubmit={(e) => {
          //create new chatroom
          e.preventDefault();

          //clear inputs
          const newMessage = messageInput.trim();
          if (!newMessage) {
            setErrorText("Message cannot be empty");
            return;
          }

          handleSendMessage(newMessage);

          setMessageInput("");
        }}
      >
        <Flex gap={2}>
          <Input
            isInvalid={errorText !== ""}
            errorBorderColor="crimson"
            type="text"
            placeholder="Type your message here..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              setErrorText("");
              if (e.key === "Enter") {
                //make user unselect the input
                return;
              }
              sendMessageTypingEvent(messageInput);
            }}
          />

          <Button colorScheme={"blue"} type="submit">
            Send
          </Button>
        </Flex>
        <Text color={"red"}>{errorText}</Text>
      </form>
      <div className="flex w-full flex-col gap-1">
        {usersTyping.map(({ user, time, message }) => (
          <div
            key={time.toString()}
            className={`flex w-full items-center justify-start p-[0.1rem]`}
          >
            <ReactLoading
              type="bubbles"
              color="#888"
              width={30}
              height={30}
              delay={0}
            />

            <Flex>
              <span className="font-bold">{user.name}</span> is typing...{" "}
              {sessionData &&
                sessionData.user.name?.toLowerCase().includes("tom") && (
                  <div className="px-1 italic">{message}</div>
                )}
            </Flex>
          </div>
        ))}
      </div>
    </div>
  );
}
