import { Flex, Text } from "@chakra-ui/react";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import useUsersActive from "~/hooks/useUsersActive";
import Avatar from "./Avatar";

interface IProps {
  show: boolean;
}
export function UsersContainer({ show }: IProps) {
  const { data: sessionData } = useSession();
  const { usersActive, addUserActive } = useUsersActive();

  if (!show) return <></>;
  return (
    sessionData && (
      <Flex className="right-0 z-10 flex h-full w-48 flex-col gap-2 border-l-2 border-gray-100 bg-white p-2 mobile-only:fixed">
        <Text>Online - {usersActive.length + 1}</Text>
        <Flex justifyContent={"start"} alignItems={"center"} gap={2}>
          <Avatar user={sessionData.user as User} />
          <Text>{sessionData.user.name}</Text>
        </Flex>
        {usersActive.map(({ user, time }: { user: User; time: Date }, i) => (
          <Flex key={i} justifyContent={"start"} alignItems={"center"} gap={2}>
            <Avatar user={user} />
            <Text>{user.name}</Text>
          </Flex>
        ))}
      </Flex>
    )
  );
}
