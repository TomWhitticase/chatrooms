import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
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

      <Link href="/chatrooms">
        <h1>Chatrooms</h1>
      </Link>
    </>
  );
};
export default Home;
