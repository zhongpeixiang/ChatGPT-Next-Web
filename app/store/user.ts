import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserAuthStore {
  user_id: string;
  password: string;

  updateUserId: (_: string) => void;
  updatePassword: (_: string) => void;
}

export const useUserAuthStore = create<UserAuthStore>()(
  persist(
    (set, get) => ({
      user_id: "",
      password: "",

      updateUserId(user_id: string) {
        set(() => ({ user_id }));
      },
      updatePassword(password: string) {
        set(() => ({ password }));
      },
    }),
    {
      name: "user-auth",
      version: 1,
    },
  ),
);
