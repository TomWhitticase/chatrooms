import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function SignIn() {
  const { data: session } = useSession();

  const handleSignIn = () => {
    void signIn("github"); // sign in using the GitHub provider
  };

  //if user is already logged in, redirect to home
  if (session) {
    return (
      <main className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <p>You are signed in as {session.user.name}</p>
        <Link href="/chatrooms">
          <button className="rounded-lg p-4 text-2xl font-bold shadow-lg">
            Join a chatroom
          </button>
        </Link>
      </main>
    );
  }

  return (
    <div>
      <form onSubmit={handleSignIn}>
        <button>Sign in with GitHub</button>
      </form>
    </div>
  );
}
