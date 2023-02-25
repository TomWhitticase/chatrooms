import type { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
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
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-4">
        You must be logged in
        <button
          className="rounded-lg bg-blue-500 p-2 text-white"
          onClick={() => void signIn()}
        >
          <a>Sign in</a>
        </button>
      </div>
    );
  }

  return (
    <div>
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
          className="input-bordered input w-full border-2"
          placeholder="New chatroom name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
        <button className="rounded bg-blue-500 px-2 text-white" type="submit">
          Create
        </button>
      </form>
      {!chatrooms || chatrooms?.length < 1 ? (
        <p className="p-4">No chatrooms. create one!</p>
      ) : (
        chatrooms?.map((chatroom, i) => (
          <div key={i} className="flex w-full border-2 ">
            <div
              key={chatroom.id}
              className="flex-1 cursor-pointer items-center justify-between gap-4 p-4 hover:underline"
              onClick={() => {
                void router.push(`/chatrooms/${chatroom.id}`);
              }}
            >
              <h2 className="text-2xl">{chatroom.name}</h2>
            </div>
            <div className="flex items-center">
              <button
                className="rounded-lg bg-slate-500 p-2 text-white"
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
          </div>
        ))
      )}
    </div>
  );
};
