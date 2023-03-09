import { Button } from "@chakra-ui/react";
import { Chatroom, User } from "@prisma/client";
import { useRouter } from "next/router";

export function ChatroomList({
  chatrooms,
  setSelectedChatroom,
  selectedChatroom,
}: {
  chatrooms:
    | (Chatroom & {
        members: User[];
      })[]
    | undefined;
  selectedChatroom:
    | (Chatroom & {
        members: User[];
      })
    | undefined;
  setSelectedChatroom: (
    chatroom:
      | (Chatroom & {
          members: User[];
        })
      | undefined
  ) => void;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-2 p-2">
      {chatrooms && chatrooms.length > 0 ? (
        chatrooms.map((chatroom, i) => (
          <Button
            className="border-b-2 p-4 "
            key={i}
            colorScheme={selectedChatroom?.id === chatroom.id ? "blue" : "gray"}
            onClick={() => setSelectedChatroom(chatroom)}
          >
            {chatroom.name}
          </Button>
        ))
      ) : (
        <div
          className="flex flex-col gap-4 text-center"
          onClick={() => void router.push("/browse")}
        >
          You haven&apos;t joined any chatrooms
          <Button>Browse rooms</Button>
        </div>
      )}
    </div>
  );
}
