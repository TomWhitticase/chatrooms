import { useRouter } from "next/router";
import React, { useState } from "react";
import { Header } from "./Header";
import { UsersContainer } from "./UsersContainer";

interface IProps {
  children: JSX.Element;
}
export default function Layout({ children }: IProps) {
  const [showUsers, setShowUsers] = useState(false);
  return (
    <main className="flex min-h-screen flex-col">
      <Header
        showUsers={showUsers}
        toggleShowUsers={() => setShowUsers(!showUsers)}
      />
      <div className="flex">
        <div className="flex-1">{children}</div>
        <UsersContainer show={showUsers} />
      </div>
    </main>
  );
}
