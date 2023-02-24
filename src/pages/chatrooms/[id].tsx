import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { api } from "~/utils/api";

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
  const { data: sessionData } = useSession();

  const [messageInput, setMessageInput] = React.useState("");

  const { data: messages, refetch: refetchMessages } =
    api.message.getAll.useQuery(
      { chatroomId: chatroomId?.toString() ?? "" },
      {
        enabled: sessionData?.user !== undefined,
        staleTime: 1000,
      }
    );

  const createMessage = api.message.create.useMutation({
    onSuccess: () => {
      void refetchMessages();
    },
  });
  const deleteMessage = api.message.delete.useMutation({
    onSuccess: () => {
      void refetchMessages();
    },
  });

  return (
    <div>
      <div>
        <h1>Messages</h1>
      </div>
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
          className="input-bordered input"
          placeholder="Name"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
        />

        <button className="btn" type="submit">
          Create
        </button>
      </form>
      <div className="flex flex-col gap-4">
        {!messages || messages?.length < 1 ? (
          <p>No messages</p>
        ) : (
          messages?.map((message) => (
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
                    <h2 className="text-2xl font-bold">
                      {message.sender.name}
                    </h2>
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
          ))
        )}
      </div>
    </div>
  );
};
