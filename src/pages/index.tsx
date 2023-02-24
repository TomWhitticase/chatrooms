import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { Header } from "~/components/Header";
import React from "react";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Chat</title>
        <meta
          name="description"
          content="A Chat room web app built using the t3 stack"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col">
        <Header />
        <Chatrooms />
      </main>
    </>
  );
};
export default Home;

const Chatrooms: React.FC = () => {
  const { data: sessionData } = useSession();

  const [nameInput, setNameInput] = React.useState("");
  const [descriptionInput, setDescriptionInput] = React.useState("");

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
          setDescriptionInput("");

          createChatroom.mutate({
            name: nameInput,
            description: descriptionInput,
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
        <input
          type="text"
          className="input-bordered input"
          placeholder="Description"
          value={descriptionInput}
          onChange={(e) => setDescriptionInput(e.target.value)}
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
              <h2 className="text-2xl">{chatroom.name}</h2>
              <p>{chatroom.description}</p>
            </div>
            <button
              className="btn"
              onClick={() => {
                deleteChatroom.mutate(
                  { id: chatroom.id },
                  {
                    onSuccess: () => {
                      void refetchChatrooms();
                    },
                  }
                );
              }}
            >
              {" "}
              Delete{" "}
            </button>
          </div>
        ))
      )}
    </div>
  );
};
