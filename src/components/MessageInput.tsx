import { Button, Input } from "@chakra-ui/react";
import React from "react";

interface IProps {
  handleSendMessage: (message: string) => void;
  sendMessageTypingEvent: () => void;
}
export default function MessageInput({
  handleSendMessage,
  sendMessageTypingEvent,
}: IProps) {
  const [messageInput, setMessageInput] = React.useState("");

  return (
    <div className="h-[4rem]">
      <form
        className="flex gap-4 p-2"
        onSubmit={(e) => {
          //create new chatroom
          e.preventDefault();

          //clear inputs
          const newMessage = messageInput.trim();
          if (!newMessage) return;

          handleSendMessage(newMessage);

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
  );
}
