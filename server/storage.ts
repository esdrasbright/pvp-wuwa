import { db } from "./db";
import { users, matches, type User, type InsertUser, type Match, type InsertMatch } from "@shared/schema";
import { eq, or } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBox(userId: number, box: Record<string, { owned: boolean, sequences: number }>): Promise<User>;
  
  // Match
  getMatch(id: number): Promise<Match | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: number, updates: Partial<Match>): Promise<Match>;
  getMatches(): Promise<Match[]>;
  joinMatch(matchId: number, userId: number, isHost?: boolean): Promise<Match>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserBox(userId: number, box: Record<string, { owned: boolean, sequences: number }>): Promise<User> {
    const [user] = await db.update(users)
      .set({ box })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getMatch(id: number): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match;
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await db.insert(matches).values(insertMatch).returning();
    return match;
  }

  async updateMatch(id: number, updates: Partial<Match>): Promise<Match> {
    const [match] = await db.update(matches)
      .set(updates)
      .where(eq(matches.id, id))
      .returning();
    return match;
  }

  async getMatches(): Promise<Match[]> {
    return await db.select().from(matches).orderBy(matches.createdAt);
  }

  async joinMatch(matchId: number, userId: number, isHost: boolean = false): Promise<Match> {
    const update = isHost ? { hostId: userId } : { guestId: userId };
    const [match] = await db.update(matches)
      .set(update)
      .where(eq(matches.id, matchId))
      .returning();
    return match;
  }
}

export const storage = new DatabaseStorage();
