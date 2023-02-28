import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Button,
  PopoverFooter,
  Flex,
  Heading,
} from "@chakra-ui/react";
import { FaUsers } from "react-icons/fa";

interface IProps {
  showUsers: boolean;
  toggleShowUsers: () => void;
}

export const Header = ({ showUsers, toggleShowUsers }: IProps) => {
  const { data: sessionData } = useSession();

  return (
    <Flex
      justifyContent={"space-between"}
      alignItems={"center"}
      h={"4rem"}
      px={2}
      borderBottom={"1px solid #e2e8f0"}
    >
      <Heading size="lg" w={"full"} textAlign={"center"}>
        Tom&apos;s Chatrooms
      </Heading>
      {sessionData?.user?.name ? (
        <div className="flex gap-4">
          <div className="flex items-center justify-center">
            <Popover>
              <PopoverTrigger>
                <Image
                  unoptimized
                  className="cursor-pointer rounded-full"
                  width={40}
                  height={40}
                  src={sessionData?.user.image || ""}
                  alt={sessionData?.user.name || ""}
                />
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader>{sessionData?.user.name}</PopoverHeader>
                <PopoverBody>{sessionData?.user.email}</PopoverBody>
                <PopoverFooter>
                  {" "}
                  <Button onClick={() => void signOut()}>Sign out</Button>
                </PopoverFooter>
              </PopoverContent>
            </Popover>
          </div>
          <Button
            className="flex items-center justify-center"
            colorScheme={showUsers ? "blue" : "gray"}
            onClick={toggleShowUsers}
          >
            <FaUsers size={30} />
          </Button>
        </div>
      ) : (
        <>
          <Button onClick={() => void signIn()}>Sign In</Button>
        </>
      )}
    </Flex>
  );
};
