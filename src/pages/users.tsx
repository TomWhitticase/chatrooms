import { Heading } from "@chakra-ui/react";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { LoadingScreen } from "~/components/LoadingScreen";
import Avatar from "~/components/user/Avatar";
import useUsersOnlineStore from "~/stores/usersOnlineStore";
import { api } from "~/utils/api";

export default function Users() {
  //states
  const { usersOnline } = useUsersOnlineStore();
  const { data: session } = useSession();
  const [usersNotOnline, setUsersNotOnline] = useState<User[]>([]);
  const { data: users, status } = api.users.getAll.useQuery(undefined, {
    enabled: session?.user !== undefined,
  });

  //actions
  useEffect(() => {
    if (users) {
      const usersNotOnline = users.filter((user) => {
        return !usersOnline.find((userOnline) => userOnline.id === user.id);
      });
      //set uses not online to users that are not online
      setUsersNotOnline(usersNotOnline);
    }
  }, [usersOnline, users]);

  if (status === "loading") return <LoadingScreen />;

  return (
    <div className="p-4">
      <Heading as="h1" size="md" className="mb-4">
        Online - {usersOnline.length}
      </Heading>
      <UsersOnline usersOnline={usersOnline} />
      <Heading as="h1" size="md" className="mb-4 mt-4">
        Offline - {usersNotOnline.length}
      </Heading>
      <UsersNotOnline usersNotOnline={usersNotOnline} />
    </div>
  );
}

function UsersOnline({ usersOnline }: { usersOnline: User[] }) {
  return (
    <>
      {usersOnline.map((user, i) => (
        <div className="flex items-center justify-start gap-2 p-2" key={i}>
          <Avatar user={user} status="online" />
          {user.name}
        </div>
      ))}
    </>
  );
}
function UsersNotOnline({ usersNotOnline }: { usersNotOnline: User[] }) {
  return (
    <>
      {usersNotOnline.map((user, i) => (
        <div className="flex items-center justify-start gap-2 p-2" key={i}>
          <Avatar user={user} status="offline" />
          {user.name}
        </div>
      ))}
    </>
  );
}
