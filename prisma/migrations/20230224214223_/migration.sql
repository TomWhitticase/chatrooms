/*
  Warnings:

  - You are about to drop the `_ChatroomMembers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatroomId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "_ChatroomMembers" DROP CONSTRAINT "_ChatroomMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChatroomMembers" DROP CONSTRAINT "_ChatroomMembers_B_fkey";

-- DropTable
DROP TABLE "_ChatroomMembers";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatroomId_fkey" FOREIGN KEY ("chatroomId") REFERENCES "Chatroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
