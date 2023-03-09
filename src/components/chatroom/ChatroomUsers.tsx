import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import useUsersOnlineStore from "~/stores/usersOnlineStore";
import Avatar from "../user/Avatar";

//display chatroom members
interface IProps {
  members: User[] | undefined;
}
export function ChatroomUsers({ members }: IProps) {
  const { data: sessionData } = useSession();
  const { usersOnline } = useUsersOnlineStore();

  //display users online first, then users offline
  return (
    <div className="flex h-full w-full flex-col items-center justify-start gap-4 p-4">
      {members?.map((member: User) => {
        if (!usersOnline.find((user) => user.id === member.id)) return;
        return (
          <div
            key={member.id}
            className="flex w-full items-center justify-start gap-4"
          >
            <Avatar user={member} status={"online"} />
            {member.name}
          </div>
        );
      })}
      {members?.map((member: User) => {
        if (usersOnline.find((user) => user.id === member.id)) return;
        return (
          <div
            key={member.id}
            className="flex w-full items-center justify-start gap-4"
          >
            <Avatar user={member} status={"offline"} />
            {member.name}
          </div>
        );
      })}
    </div>
  );
}
