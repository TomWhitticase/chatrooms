import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export const Header = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="navbar w-full justify-between bg-primary text-primary-content">
      <div className="flex-1 pl-5 text-3xl font-bold">Chat</div>
      {sessionData?.user?.name ? (
        <div className="flex gap-4">
          <button className="btn" onClick={() => void signOut()}>
            Sign out
          </button>
          <Image
            className="rounded-full"
            width={40}
            height={40}
            src={sessionData?.user.image || ""}
            alt={sessionData?.user.name || ""}
          />
        </div>
      ) : (
        <>
          <button className="btn" onClick={() => void signIn()}>
            Sign In
          </button>
        </>
      )}
    </div>
  );
};
