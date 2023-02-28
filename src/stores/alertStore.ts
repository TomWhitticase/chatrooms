import { User } from "@prisma/client";
import { create } from "zustand";

interface IAlert {
  type: "user-joined" | "user-left";
  user: User;
}
interface IAlertStore {
  alerts: IAlert[];
  addAlert: (alert: IAlert) => void;
  clearAlerts: () => void;
}

const useAlertStore = create<IAlertStore>((set) => ({
  alerts: [],
  addAlert: (alert: IAlert) =>
    set((state: IAlertStore) => ({
      alerts: [...state.alerts, alert],
    })),
  clearAlerts: () =>
    set((state: IAlertStore) => ({
      alerts: [],
    })),
}));

export default useAlertStore;
