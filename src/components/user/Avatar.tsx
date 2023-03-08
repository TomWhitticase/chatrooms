import React from "react";
import type { User } from "@prisma/client";
import Image from "next/image";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
} from "@chakra-ui/react";

interface IProps {
  user: User;
  status?: "online" | "offline";
}
export default function Avatar({ user, status }: IProps) {
  return (
    <Popover placement="top-start">
      <PopoverTrigger>
        <div className="relative">
          <Image
            className="cursor-pointer rounded-full"
            src={user.image ?? ""}
            alt={user.name ?? ""}
            width={30}
            height={30}
          />
          {status === "online" && (
            <div className="absolute bottom-0 right-0 h-[0.7rem] w-[0.7rem] rounded-full border-2 border-white bg-green-500"></div>
          )}
          {status === "offline" && (
            <div className="absolute bottom-0 right-0 h-[0.7rem] w-[0.7rem] rounded-full border-2 border-white bg-gray-400"></div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader fontWeight="semibold">{user.name}</PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>{user.email}</PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
