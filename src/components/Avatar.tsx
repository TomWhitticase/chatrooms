import React from "react";
import { User } from "@prisma/client";
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
} from "@chakra-ui/react";

interface IProps {
  user: User;
}
export default function Avatar({ user }: IProps) {
  return (
    <Popover placement="top-start">
      <PopoverTrigger>
        <Image
          className="cursor-pointer rounded-full"
          src={user.image ?? ""}
          alt={user.name ?? ""}
          width={30}
          height={30}
        />
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
