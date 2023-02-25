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
        <Link href="/chatrooms">
          <button className="rounded-lg border-2 p-4 text-2xl font-bold shadow-lg">
            Join a chatroom
          </button>
        </Link>
      </main>
    </>
  );
};
export default Home;
