import { Flex, Text } from "@chakra-ui/react";
import { User } from "@prisma/client";
import Avatar from "./Avatar";

interface IProps {
  usersActive: { user: User; time: Date }[];
}
export function UsersContainer({ usersActive }: IProps) {
  return (
    <Flex className="flex w-48 flex-col gap-2 p-2">
      <Text>Online - {usersActive.length}</Text>
      {usersActive.length === 0 ? (
        <Flex justifyContent={"start"} alignItems={"center"} gap={2}>
          <Text>Nobody else is online</Text>
        </Flex>
      ) : (
        usersActive.map(({ user, time }) => (
          <Flex
            key={time.toString()}
            justifyContent={"start"}
            alignItems={"center"}
            gap={2}
          >
            <Avatar user={user} />
            <Text>{user.name}</Text>
          </Flex>
        ))
      )}
    </Flex>
  );
}
