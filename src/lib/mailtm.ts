// mail.tm API client — free public disposable email service.
// No API key. CORS-enabled. Receive-only (free tier).
const API = "https://api.mail.tm";

export type MailtmAccount = {
  id: string;
  address: string;
  password: string;
  token: string;
};

export type MailtmMessage = {
  id: string;
  from: { address: string; name: string };
  to: { address: string; name: string }[];
  subject: string;
  intro: string;
  seen: boolean;
  createdAt: string;
};

export type MailtmFullMessage = MailtmMessage & {
  text: string;
  html: string[];
};

// New multi-account storage
const STORE_KEY = "mailtm.store";
// Legacy single-account storage (migrated on read)
const LEGACY_KEY = "mailtm.account";

export type MailtmStore = {
  accounts: MailtmAccount[];
  activeId: string | null;
};

function emptyStore(): MailtmStore {
  return { accounts: [], activeId: null };
}

export function loadStore(): MailtmStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw) as MailtmStore;
      if (s && Array.isArray(s.accounts)) return s;
    }
    // migrate legacy
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const acc = JSON.parse(legacy) as MailtmAccount;
      const store: MailtmStore = { accounts: [acc], activeId: acc.id };
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
      localStorage.removeItem(LEGACY_KEY);
      return store;
    }
  } catch {}
  return emptyStore();
}

export function saveStore(s: MailtmStore) {
  localStorage.setItem(STORE_KEY, JSON.stringify(s));
}

export function clearStore() {
  localStorage.removeItem(STORE_KEY);
  localStorage.removeItem(LEGACY_KEY);
}

// Back-compat helpers used elsewhere
export function loadAccount(): MailtmAccount | null {
  const s = loadStore();
  return s.accounts.find((a) => a.id === s.activeId) ?? s.accounts[0] ?? null;
}

async function jsonOrThrow(r: Response, fallback: string) {
  if (r.ok) return r.status === 204 ? null : r.json();
  let msg = fallback;
  try {
    const j = await r.json();
    msg = j["hydra:description"] || j.message || j.detail || fallback;
  } catch {}
  throw new Error(`${msg} (${r.status})`);
}

export async function getDomains(): Promise<string[]> {
  const r = await fetch(`${API}/domains?page=1`);
  const j = await jsonOrThrow(r, "Failed to load domains");
  return (j["hydra:member"] || [])
    .filter((d: any) => d.isActive && !d.isPrivate)
    .map((d: any) => d.domain);
}

function randomLocal() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return "lova" + Array.from(bytes).map((b) => b.toString(36)).join("").slice(0, 8);
}
function randomPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return Array.from(bytes).map((b) => b.toString(36)).join("").slice(0, 24);
}

export async function createAccount(localPart?: string, customPassword?: string): Promise<MailtmAccount> {
  const domains = await getDomains();
  if (!domains.length) throw new Error("No mail.tm domains available right now");
  const domain = domains[0];
  const cleaned = (localPart || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const local = cleaned || randomLocal();
  const address = `${local}@${domain}`;
  const password = customPassword?.trim() || randomPassword();

  const r = await fetch(`${API}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });
  const acc = await jsonOrThrow(r, "Failed to create inbox (this address may be taken — try another)");
  const token = await getToken(address, password);
  return { id: acc.id, address, password, token };
}

export async function loginAccount(address: string, password: string): Promise<MailtmAccount> {
  const token = await getToken(address.trim(), password);
  const r = await fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } });
  const me = await jsonOrThrow(r, "Failed to load account");
  return { id: me.id, address: me.address ?? address.trim(), password, token };
}

export async function getToken(address: string, password: string): Promise<string> {
  const r = await fetch(`${API}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });
  const j = await jsonOrThrow(r, "Login failed");
  return j.token;
}

export async function ensureToken(acc: MailtmAccount): Promise<MailtmAccount> {
  const r = await fetch(`${API}/me`, { headers: { Authorization: `Bearer ${acc.token}` } });
  if (r.ok) return acc;
  const token = await getToken(acc.address, acc.password);
  return { ...acc, token };
}

export async function listMessages(token: string, page = 1): Promise<MailtmMessage[]> {
  const r = await fetch(`${API}/messages?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const j = await jsonOrThrow(r, "Failed to fetch messages");
  return j["hydra:member"] || [];
}

export async function getMessage(token: string, id: string): Promise<MailtmFullMessage> {
  const r = await fetch(`${API}/messages/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return jsonOrThrow(r, "Failed to fetch message");
}

export async function deleteMessage(token: string, id: string): Promise<void> {
  const r = await fetch(`${API}/messages/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok && r.status !== 204) throw new Error(`Failed to delete (${r.status})`);
}

export async function markRead(token: string, id: string): Promise<void> {
  await fetch(`${API}/messages/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/merge-patch+json",
    },
    body: JSON.stringify({ seen: true }),
  });
}
