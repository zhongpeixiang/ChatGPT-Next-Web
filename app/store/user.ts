import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserAuthStore {
  user_id: string;
  password: string;

  get: () => any;
  set: (user_id: string, password: string) => void;
  updateUserId: (user_id: string) => void;
  updatePassword: (password: string) => void;
}

export const useUserAuthStore = create<UserAuthStore>()(
  persist(
    (set, get) => ({
      user_id: "",
      password: "",

      get() {
        return {
          user_id: get()["user_id"],
          password: get()["password"],
        };
      },
      set(user_id: string, password: string) {
        set(() => ({
          user_id: user_id,
          password: password,
        }));
      },
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
