import type { User } from "@prisma/client";
import { create } from "zustand";

interface IUsersOnlineStore {
  usersOnline: User[];
  setUsersOnline: (usersOnline: User[]) => void;
}

const useUsersOnlineStore = create<IUsersOnlineStore>((set) => ({
  usersOnline: [],
  setUsersOnline: (usersOnline) => set({ usersOnline }),
}));

export default useUsersOnlineStore;
