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
  passwordHash?: string;
}

export interface AnnouncementRecord {
  id: number;
  authorId: number;
  authorName: string;
  authorRole: Role;
  authorTitle: string | null;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: number; // ms since epoch
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
  // Everyone, A to Z by name, without password hashes. `search` matches name or email.
  listUsers(search?: string): Promise<User[]>;
  createSession(input: {
    tokenHash: string;
    userId: number;
    expiresAt: number;
  }): Promise<void>;
  findSession(tokenHash: string): Promise<StoredSession | null>;
  deleteSession(tokenHash: string): Promise<void>;
  deleteSessionsForUser(userId: number): Promise<void>;
  createAnnouncement(input: {
    authorId: number;
    title: string;
    body: string;
    pinned: boolean;
    createdAt?: number;
  }): Promise<AnnouncementRecord>;
  // Pinned first, then newest first.
  listAnnouncements(): Promise<AnnouncementRecord[]>;
  findAnnouncement(id: number): Promise<AnnouncementRecord | null>;
  setAnnouncementPinned(id: number, pinned: boolean): Promise<AnnouncementRecord | null>;
  deleteAnnouncement(id: number): Promise<void>;
}
