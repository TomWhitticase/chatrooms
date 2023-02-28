import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react";
import { Formik } from "formik";
import React, { ReactElement, useRef } from "react";

interface IProps {
  handleSendMessage: (message: string) => void;
  sendMessageTypingEvent: () => void;
}
export default function MessageInput({
  handleSendMessage,
  sendMessageTypingEvent,
}: IProps) {
  const [messageInput, setMessageInput] = React.useState("");
  const [errorText, setErrorText] = React.useState("");
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
              sendMessageTypingEvent();
            }}
          />

          <Button colorScheme={"blue"} type="submit">
            Send
          </Button>
        </Flex>
        <Text color={"red"}>{errorText}</Text>
      </form>
    </div>
  );
}
