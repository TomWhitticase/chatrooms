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

export const Header = () => {
  const { data: sessionData } = useSession();

  return (
    <Flex
      justifyContent={"space-between"}
      alignItems={"center"}
      h={"4rem"}
      px={2}
      borderBottom={"1px solid #e2e8f0"}
    >
      <Heading w={"full"} textAlign={"center"}>
        Tom&apos;s Chatrooms
      </Heading>
      {sessionData?.user?.name ? (
        <div className="">
          <Popover>
            <PopoverTrigger>
              <Image
                className="cursor-pointer rounded-full"
                width={30}
                height={30}
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
      ) : (
        <>
          <Button onClick={() => void signIn()}>Sign In</Button>
        </>
      )}
    </Flex>
  );
};
