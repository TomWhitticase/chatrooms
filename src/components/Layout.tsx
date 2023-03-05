import { useRouter } from "next/router";
import React, { useState } from "react";
import { Header } from "./Header";

interface IProps {
  children: JSX.Element;
}
export default function Layout({ children }: IProps) {
  const [showUsers, setShowUsers] = useState(false);
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="flex">
        <div className="flex-1">{children}</div>
      </div>
    </main>
  );
}
