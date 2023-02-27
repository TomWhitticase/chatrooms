import { Button, Heading } from "@chakra-ui/react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
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
      <main className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center py-2">
        <Heading p={4}>Welcome to Tom's chatrooms</Heading>
        <Link href="/chatrooms">
          <Button colorScheme="blue">Join a chatroom</Button>
        </Link>
      </main>
    </>
  );
};
export default Home;
