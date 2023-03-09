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
import { TabList, Tab } from "@tremor/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const Header = () => {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState(router.pathname);

  return (
    <Flex
      position={"relative"}
      justifyContent={"space-between"}
      alignItems={"center"}
      h={"4rem"}
      px={2}
      borderBottom={"1px solid #e2e8f0"}
    >
      <div className="flex h-full items-center justify-center">
        <Heading size="lg" textAlign={"start"}>
          Tom&apos;s Chatrooms
        </Heading>
      </div>
      <div className="absolute bottom-0 right-1/2 translate-x-1/2">
        <TabList
          value={router.pathname}
          handleSelect={(value) => void router.push(value as string)}
          marginTop="mt-6"
        >
          <Tab value={"/"} text="Home" />
          <Tab value={"/chat"} text="Chat" />
          <Tab value={"/browse"} text="browse" />
          <Tab value={"/users"} text="Users" />
        </TabList>
      </div>

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
        </div>
      ) : (
        <>
          <Button onClick={() => void signIn()}>Sign In</Button>
        </>
      )}
    </Flex>
  );
};
