import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  return (
    <div>
      <Chatrooms />
    </div>
  );
};
export default Home;

const Chatrooms: React.FC = () => {
  const router = useRouter();
  const { data: sessionData, status } = useSession();

  const [nameInput, setNameInput] = React.useState("");

  const { data: chatrooms, refetch: refetchChatrooms } =
    api.chatroom.getAll.useQuery(undefined, {
      enabled: sessionData?.user !== undefined,
    });

  const createChatroom = api.chatroom.create.useMutation({
    onSuccess: () => {
      void refetchChatrooms();
    },
  });
  const deleteChatroom = api.chatroom.delete.useMutation({
    onSuccess: () => {
      void refetchChatrooms();
    },
  });
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return <p>You must be logged in</p>;
  }

  return (
    <div>
      <div>
        <h1>Chatrooms</h1>
      </div>
      <form
        className="flex gap-4 p-4"
        onSubmit={(e) => {
          //create new chatroom
          e.preventDefault();

          //clear inputs
          setNameInput("");

          void createChatroom.mutate({
            name: nameInput,
          });
        }}
      >
        <input
          type="text"
          className="input-bordered input"
          placeholder="Name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
        <button className="btn" type="submit">
          Create
        </button>
      </form>
      {!chatrooms || chatrooms?.length < 1 ? (
        <p>No chatrooms</p>
      ) : (
        chatrooms?.map((chatroom) => (
          <div
            key={chatroom.id}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex flex-col">
              <button
                onClick={() => {
                  void router.push(`/chatrooms/${chatroom.id}`);
                }}
              >
                <h2 className="text-2xl">{chatroom.name}</h2>
              </button>
            </div>
            <button
              className="btn"
              onClick={() => {
                void deleteChatroom.mutate(
                  { id: chatroom.id },
                  {
                    onSuccess: () => {
                      void refetchChatrooms();
                    },
                  }
                );
              }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};
