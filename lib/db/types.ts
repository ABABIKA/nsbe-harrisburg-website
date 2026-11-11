import type { Role } from "../auth/roles";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  title: string | null;
  tokens: number;
}

export interface UserRecord extends User {
  passwordHash: string;
}

export class EmailTakenError extends Error {
  constructor() {
    super("email_taken");
    this.name = "EmailTakenError";
  }
}

export interface NewUser {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  title: string | null;
}

export interface UserPatch {
  role?: Role;
  title?: string | null;
  tokens?: number;
}

export interface StoredSession {
  userId: number;
  expiresAt: number;
}

// Everything the site needs from a database. To move to a hosted database,
// implement this interface for it and point getStore() at the new class.
export interface Store {
  createUser(input: NewUser): Promise<UserRecord>;
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: number): Promise<UserRecord | null>;
  updateUser(id: number, patch: UserPatch): Promise<UserRecord | null>;
  countUsersWithRole(role: Role): Promise<number>;
  createSession(input: {
    tokenHash: string;
    userId: number;
    expiresAt: number;
  }): Promise<void>;
  findSession(tokenHash: string): Promise<StoredSession | null>;
  deleteSession(tokenHash: string): Promise<void>;
}
