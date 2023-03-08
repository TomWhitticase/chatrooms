import { createTRPCRouter } from "~/server/api/trpc";
import { chatroomRouter } from "./routers/chatrooms";
import { messageRouter } from "./routers/messages";
import { usersRouter } from "./routers/users";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  chatroom: chatroomRouter,
  message: messageRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
