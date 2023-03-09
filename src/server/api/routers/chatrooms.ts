import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const chatroomRouter = createTRPCRouter({
  getRoom: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.chatroom.findUnique({ where: { id: input.id } });
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.chatroom.findMany({ include: { members: true } });
  }),
  //get chatrooms that the user is a member of
  getMemberOf: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.chatroom.findMany({
      where: {
        members: {
          some: {
            id: ctx.session.user.id,
          },
        },
      },
      include: { members: true },
    });
  }),
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.chatroom.create({
        data: {
          name: input.name,
          creatorId: ctx.session.user.id,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.chatroom.delete({
        where: {
          id: input.id,
        },
      });
    }),
  join: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.chatroom.update({
        where: {
          id: input.id,
        },
        data: {
          members: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    }),
  leave: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.chatroom.update({
        where: {
          id: input.id,
        },
        data: {
          members: {
            disconnect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    }),
});

/*
//for reference
model Chatroom {
  id           String    @id @default(cuid())
  name         String
  description  String?
  creatorId    String
  createdAt    DateTime  @default(now())
//   members      User[]    @relation("ChatroomMembers")
  messages     Message[] @relation("ChatroomMessages")
}
*/
