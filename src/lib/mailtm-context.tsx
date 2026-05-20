import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  loadStore,
  saveStore,
  clearStore,
  ensureToken,
  createAccount,
  loginAccount,
  type MailtmAccount,
  type MailtmStore,
} from "./mailtm";

type Ctx = {
  account: MailtmAccount | null;
  accounts: MailtmAccount[];
  loading: boolean;
  create: (localPart?: string, password?: string) => Promise<MailtmAccount>;
  login: (address: string, password: string) => Promise<MailtmAccount>;
  switchTo: (id: string) => void;
  remove: (id: string) => void;
  signOut: () => void;
};

const C = createContext<Ctx>({
  account: null,
  accounts: [],
  loading: true,
  create: async () => ({} as MailtmAccount),
  login: async () => ({} as MailtmAccount),
  switchTo: () => {},
  remove: () => {},
  signOut: () => {},
});

export function MailtmProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<MailtmStore>({ accounts: [], activeId: null });
  const [loading, setLoading] = useState(true);

  function persist(next: MailtmStore) {
    setStore(next);
    saveStore(next);
  }

  useEffect(() => {
    const s = loadStore();
    if (!s.accounts.length) {
      setLoading(false);
      return;
    }
    // Refresh tokens for all accounts in parallel; drop any that fail
    Promise.all(
      s.accounts.map((a) =>
        ensureToken(a)
          .then((acc) => acc)
          .catch(() => null),
      ),
    )
      .then((res) => {
        const accounts = res.filter((a): a is MailtmAccount => !!a);
        const activeId =
          s.activeId && accounts.some((a) => a.id === s.activeId)
            ? s.activeId
            : accounts[0]?.id ?? null;
        const next = { accounts, activeId };
        persist(next);
      })
      .finally(() => setLoading(false));
  }, []);

  const account = store.accounts.find((a) => a.id === store.activeId) ?? null;

  return (
    <C.Provider
      value={{
        account,
        accounts: store.accounts,
        loading,
        create: async (localPart, password) => {
          const a = await createAccount(localPart, password);
          const next: MailtmStore = {
            accounts: [...store.accounts.filter((x) => x.id !== a.id), a],
            activeId: a.id,
          };
          persist(next);
          return a;
        },
        login: async (address, password) => {
          const a = await loginAccount(address, password);
          const next: MailtmStore = {
            accounts: [...store.accounts.filter((x) => x.id !== a.id), a],
            activeId: a.id,
          };
          persist(next);
          return a;
        },
        switchTo: (id) => {
          if (!store.accounts.some((a) => a.id === id)) return;
          persist({ ...store, activeId: id });
        },
        remove: (id) => {
          const accounts = store.accounts.filter((a) => a.id !== id);
          const activeId =
            store.activeId === id ? accounts[0]?.id ?? null : store.activeId;
          persist({ accounts, activeId });
        },
        signOut: () => {
          clearStore();
          setStore({ accounts: [], activeId: null });
        },
      }}
    >
      {children}
    </C.Provider>
  );
}

export const useMailtm = () => useContext(C);
