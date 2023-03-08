import { Button, Heading } from "@chakra-ui/react";
import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import React from "react";

const Home: NextPage = () => {
  const { data: session, status } = useSession();
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
      <main className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center py-2">
        <Heading p={4}>Welcome to Tom&apos;s chatrooms</Heading>
        {status === "authenticated" ? (
          <Link href="/chat">
            <Button colorScheme="blue">Start chatting</Button>
          </Link>
        ) : (
          <Button onClick={() => void signIn()} colorScheme="blue">
            Sign in to start chatting
          </Button>
        )}
      </main>
    </>
  );
};
export default Home;
