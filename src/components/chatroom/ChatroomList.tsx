import { Button } from "@chakra-ui/react";
import { Chatroom } from "@prisma/client";

export function ChatroomList({
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
