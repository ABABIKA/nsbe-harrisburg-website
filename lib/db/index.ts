import { SqliteStore } from "./sqlite";
import type { Store } from "./types";

// Kept on globalThis so Next's dev-server reloads reuse one connection.
const globalForStore = globalThis as unknown as { __nsbeStore?: Store };

export function getStore(): Store {
  if (!globalForStore.__nsbeStore) {
    globalForStore.__nsbeStore = new SqliteStore(
      process.env.DATABASE_FILE ?? "./data/nsbe.sqlite",
    );
  }
  return globalForStore.__nsbeStore;
}
