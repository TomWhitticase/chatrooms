import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export const Header = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex h-[4rem] w-full justify-between bg-slate-600 p-4">
      <div className="flex-1 pl-5 text-3xl font-bold">Chat</div>
      {sessionData?.user?.name ? (
        <div className="flex gap-4">
          <button
            className="rounded bg-blue-500 text-white"
            onClick={() => void signOut()}
          >
            Sign out
          </button>
          <Image
            className="rounded-full"
            width={30}
            height={30}
            src={sessionData?.user.image || ""}
            alt={sessionData?.user.name || ""}
          />
        </div>
      ) : (
        <>
          <button
            className="rounded bg-blue-500 text-white"
            onClick={() => void signIn()}
          >
            Sign In
          </button>
        </>
      )}
    </div>
  );
};
