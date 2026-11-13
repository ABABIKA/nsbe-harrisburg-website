import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { Role } from "../auth/roles";
import {
  EmailTakenError,
  type AnnouncementRecord,
  type NewUser,
  type User,
  type Store,
  type StoredSession,
  type UserPatch,
  type UserRecord,
} from "./types";

interface Row {
  id: number;
  name: string;
  email: string;
  role: Role;
  title: string | null;
  tokens: number;
  password_hash: string;
}

const clean = (email: string) => email.trim().toLowerCase();

function toRecord(row: Row): UserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    title: row.title,
    tokens: row.tokens,
    passwordHash: row.password_hash,
  };
}

interface AnnouncementRow {
  id: number;
  author_id: number;
  author_name: string;
  author_role: Role;
  author_title: string | null;
  title: string;
  body: string;
  pinned: number;
  created_at: number;
}

const ANNOUNCEMENT_SELECT = `
  SELECT a.id, a.author_id, u.name AS author_name, u.role AS author_role,
         u.title AS author_title, a.title, a.body, a.pinned, a.created_at
  FROM announcements a JOIN users u ON u.id = a.author_id`;

function toAnnouncement(r: AnnouncementRow): AnnouncementRecord {
  return {
    id: r.id,
    authorId: r.author_id,
    authorName: r.author_name,
    authorRole: r.author_role,
    authorTitle: r.author_title,
    title: r.title,
    body: r.body,
    pinned: r.pinned === 1,
    createdAt: r.created_at,
  };
}

export class SqliteStore implements Store {
  private db: DatabaseSync;

  constructor(file: string) {
    if (file !== ":memory:") mkdirSync(dirname(file), { recursive: true });
    this.db = new DatabaseSync(file);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        title TEXT,
        tokens INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        expires_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        pinned INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );
    `);
  }

  async createUser(input: NewUser): Promise<UserRecord> {
    try {
      const result = this.db
        .prepare(
          "INSERT INTO users (name, email, password_hash, role, title) VALUES (?, ?, ?, ?, ?)",
        )
        .run(input.name, clean(input.email), input.passwordHash, input.role, input.title);
      return (await this.findUserById(Number(result.lastInsertRowid)))!;
    } catch (err) {
      if (err instanceof Error && /UNIQUE/i.test(err.message)) {
        throw new EmailTakenError();
      }
      throw err;
    }
  }

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const row = this.db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(clean(email)) as unknown as Row | undefined;
    return row ? toRecord(row) : null;
  }

  async findUserById(id: number): Promise<UserRecord | null> {
    const row = this.db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(id) as unknown as Row | undefined;
    return row ? toRecord(row) : null;
  }

  async updateUser(id: number, patch: UserPatch): Promise<UserRecord | null> {
    const current = await this.findUserById(id);
    if (!current) return null;
    const next = {
      role: patch.role ?? current.role,
      title: patch.title === undefined ? current.title : patch.title,
      tokens: patch.tokens ?? current.tokens,
      passwordHash: patch.passwordHash ?? current.passwordHash,
    };
    this.db
      .prepare(
        "UPDATE users SET role = ?, title = ?, tokens = ?, password_hash = ? WHERE id = ?",
      )
      .run(next.role, next.title, next.tokens, next.passwordHash, id);
    return this.findUserById(id);
  }

  async countUsersWithRole(role: Role): Promise<number> {
    const row = this.db
      .prepare("SELECT COUNT(*) AS n FROM users WHERE role = ?")
      .get(role) as unknown as { n: number };
    return row.n;
  }

  async listUsers(search?: string): Promise<User[]> {
    const term = (search ?? "").trim().toLowerCase();
    // Escape LIKE wildcards so "%" and "_" are searched literally.
    const like = `%${term.replace(/[\\%_]/g, (c) => "\\" + c)}%`;
    const rows = (
      term
        ? this.db
            .prepare(
              "SELECT * FROM users WHERE lower(name) LIKE ? ESCAPE '\\' OR lower(email) LIKE ? ESCAPE '\\' ORDER BY name COLLATE NOCASE",
            )
            .all(like, like)
        : this.db.prepare("SELECT * FROM users ORDER BY name COLLATE NOCASE").all()
    ) as unknown as Row[];
    return rows.map((row) => {
      const { passwordHash: _unused, ...user } = toRecord(row);
      void _unused;
      return user;
    });
  }

  async createSession(input: {
    tokenHash: string;
    userId: number;
    expiresAt: number;
  }): Promise<void> {
    this.db
      .prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
      .run(input.tokenHash, input.userId, input.expiresAt);
  }

  async findSession(tokenHash: string): Promise<StoredSession | null> {
    const row = this.db
      .prepare("SELECT user_id, expires_at FROM sessions WHERE token_hash = ?")
      .get(tokenHash) as unknown as { user_id: number; expires_at: number } | undefined;
    return row ? { userId: row.user_id, expiresAt: row.expires_at } : null;
  }

  async deleteSession(tokenHash: string): Promise<void> {
    this.db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
  }

  async deleteSessionsForUser(userId: number): Promise<void> {
    this.db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  }

  async createAnnouncement(input: {
    authorId: number;
    title: string;
    body: string;
    pinned: boolean;
    createdAt?: number;
  }): Promise<AnnouncementRecord> {
    const result = this.db
      .prepare(
        "INSERT INTO announcements (author_id, title, body, pinned, created_at) VALUES (?, ?, ?, ?, ?)",
      )
      .run(input.authorId, input.title, input.body, input.pinned ? 1 : 0, input.createdAt ?? Date.now());
    return (await this.findAnnouncement(Number(result.lastInsertRowid)))!;
  }

  async listAnnouncements(): Promise<AnnouncementRecord[]> {
    const rows = this.db
      .prepare(`${ANNOUNCEMENT_SELECT} ORDER BY a.pinned DESC, a.created_at DESC, a.id DESC`)
      .all() as unknown as AnnouncementRow[];
    return rows.map(toAnnouncement);
  }

  async findAnnouncement(id: number): Promise<AnnouncementRecord | null> {
    const row = this.db
      .prepare(`${ANNOUNCEMENT_SELECT} WHERE a.id = ?`)
      .get(id) as unknown as AnnouncementRow | undefined;
    return row ? toAnnouncement(row) : null;
  }

  async setAnnouncementPinned(id: number, pinned: boolean): Promise<AnnouncementRecord | null> {
    this.db.prepare("UPDATE announcements SET pinned = ? WHERE id = ?").run(pinned ? 1 : 0, id);
    return this.findAnnouncement(id);
  }

  async deleteAnnouncement(id: number): Promise<void> {
    this.db.prepare("DELETE FROM announcements WHERE id = ?").run(id);
  }
}
