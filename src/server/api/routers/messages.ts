import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const messageRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ chatroomId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.message.findMany({
        where: {
          chatroomId: input.chatroomId,
        },
        include: {
          sender: true,
        },
      });
    }),
  create: protectedProcedure
    .input(z.object({ content: z.string(), chatroomId: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.message.create({
        data: {
          content: input.content,
          chatroomId: input.chatroomId,
          senderId: ctx.session.user.id,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.message.delete({
        where: {
          id: input.id,
        },
      });
    }),
});

/*
//for reference
model Message {
  id           String   @id @default(cuid())
  content      String
  senderId     String
  sentAt       DateTime @default(now())
  chatroomId   String
  chatroom     Chatroom @relation("ChatroomMessages", fields: [chatroomId], references: [id])
  sender       User     @relation("UserMessages", fields: [senderId], references: [id])
}
*/
