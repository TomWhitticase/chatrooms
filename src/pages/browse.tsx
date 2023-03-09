import {
  TableContainer,
  Table,
  TableCaption,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Tfoot,
  Button,
  AvatarGroup,
  useDisclosure,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Input,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Avatar from "~/components/user/Avatar";
import { api } from "~/utils/api";

//browse list of chatrooms
export default function Browse() {
  const { data: session, status } = useSession();

  //new chatroom modal
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    data: chatrooms,
    status: chatroomsStatus,
    refetch: refetchChatrooms,
  } = api.chatroom.getAll.useQuery(undefined, {
    enabled: session?.user !== undefined,
  });

  const joinChatroom = api.chatroom.join.useMutation({
    onSuccess: () => {
      void refetchChatrooms();
    },
  });
  const leaveChatroom = api.chatroom.leave.useMutation({
    onSuccess: () => {
      void refetchChatrooms();
    },
  });
  const createChatroom = api.chatroom.create.useMutation({
    onSuccess: () => {
      void refetchChatrooms();
    },
  });
  const deleteChatroom = api.chatroom.delete.useMutation({
    onSuccess: () => {
      void refetchChatrooms();
    },
  });

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <CreateChatroomForm
        isOpen={isOpen}
        onClose={onClose}
        handleCreateChatroom={(name: string) => {
          void createChatroom.mutate({
            name,
          });
          void onClose();
        }}
      />
      <div className="flex w-full items-center justify-center p-4">
        <Button onClick={onOpen}>Create chatroom</Button>
      </div>

      <TableContainer w="full">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Members</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {chatrooms?.map((chatroom) => (
              <tr key={chatroom.id}>
                <Td className="w-64">{chatroom.name}</Td>
                <Td className="w-full">
                  <AvatarGroup size="sm" max={2}>
                    {chatroom.members.map((member) => (
                      <Avatar key={member.id} user={member} />
                    ))}
                  </AvatarGroup>
                  {chatroom.members.length === 0 && "No members"}
                </Td>

                <Td>
                  {chatroom.members.find(
                    (member) => member.id === session?.user.id
                  ) ? (
                    <Button
                      colorScheme="red"
                      onClick={() => {
                        leaveChatroom.mutate({ id: chatroom.id });
                      }}
                    >
                      Leave
                    </Button>
                  ) : (
                    <Button
                      colorScheme="green"
                      onClick={() => {
                        joinChatroom.mutate({ id: chatroom.id });
                      }}
                    >
                      Join
                    </Button>
                  )}
                </Td>
                <Td>
                  <Button
                    isDisabled={chatroom.members.length > 0}
                    colorScheme="gray"
                    onClick={() => {
                      deleteChatroom.mutate({ id: chatroom.id });
                    }}
                  >
                    Delete
                  </Button>
                </Td>
              </tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </div>
  );
}
function CreateChatroomForm({
  isOpen,
  onClose,
  handleCreateChatroom,
}: {
  isOpen: boolean;
  onClose: () => void;
  handleCreateChatroom: (name: string) => void;
}) {
  const [chatroomName, setChatroomName] = useState<string>("");
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New Chatroom</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            placeholder="Chatroom name"
            onChange={(e) => {
              setChatroomName(e.target.value);
            }}
          />
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="green"
            onClick={() => {
              handleCreateChatroom(chatroomName);
            }}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
