import { Button, Divider, Flex, Heading, Input } from "@chakra-ui/react";
import type { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import Loading from "react-loading";
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
    return (
      <Flex className="h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-4">
        <Loading />
      </Flex>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Flex className="h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-4">
        <Heading>You must login using Github</Heading>
        <Button colorScheme={"blue"} onClick={() => void signIn()}>
          <a>Sign in</a>
        </Button>
      </Flex>
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
        <Input
          type="text"
          placeholder="New chatroom name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
        <Button colorScheme={"blue"} type="submit">
          Create
        </Button>
      </form>
      <Flex px={2} gap={2} flexDirection={"column"}>
        {!chatrooms || chatrooms?.length < 1 ? (
          <p className="p-4">No chatrooms. create one!</p>
        ) : (
          chatrooms?.map((chatroom, i) => (
            <>
              <Flex key={i} px={2} gap={2}>
                <Button
                  justifyContent={"flex-start"}
                  variant={"ghost"}
                  key={chatroom.id}
                  className="flex-1"
                  onClick={() => {
                    void router.push(`/chatrooms/${chatroom.id}`);
                  }}
                >
                  <h2 className="text-2xl">{chatroom.name}</h2>
                </Button>
                <div className="flex items-center">
                  <Button
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
                  </Button>
                </div>
              </Flex>
              <Divider />
            </>
          ))
        )}
      </Flex>
    </div>
  );
};
