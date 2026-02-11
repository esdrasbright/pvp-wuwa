import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").unique(),
  username: text("username").notNull(),
  avatar: text("avatar"),
  // Stores the player's roster: { [charId]: { owned: boolean, sequences: number } }
  box: jsonb("box").$type<Record<string, { owned: boolean, sequences: number }>>().default({}),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").references(() => users.id),
  guestId: integer("guest_id").references(() => users.id),
  winnerId: integer("winner_id").references(() => users.id),
  
  // Game Configuration
  mode: text("mode").notNull().default("WhiWa"), // 'WhiWa' | 'ToA'
  banTime: integer("ban_time").default(300), // Seconds
  prepTime: integer("prep_time").default(420), // Seconds (7 mins)
  
  // Game State
  status: text("status").notNull().default("waiting"), // 'waiting', 'drafting', 'preparation', 'finished'
  currentPhase: text("current_phase").default("config"), // 'ban1', 'pick1', 'ban2', 'pick2', 'preparation'
  currentTurn: integer("current_turn"), // userId of current turn
  
  // Draft Data
  bans: jsonb("bans").$type<{ [userId: number]: string[] }>().default({}),
  picks: jsonb("picks").$type<{ [userId: number]: string[] }>().default({}),
  
  // Teams (Final result after preparation)
  teams: jsonb("teams").$type<{ [userId: number]: { team1: string[], team2: string[] } }>().default({}),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).pick({
  discordId: true,
  username: true,
  avatar: true,
  box: true,
});

export const insertMatchSchema = createInsertSchema(matches).pick({
  hostId: true,
  mode: true,
  banTime: true,
  prepTime: true,
});

// === TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Match = typeof matches.$inferSelect;

export type CharacterState = {
  id: string;
  owned: boolean;
  sequences: number;
};

export type Box = Record<string, { owned: boolean, sequences: number }>;

export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_MATCH: 'join_match',
  UPDATE_MATCH: 'update_match', // Server -> Client: Full state sync
  DRAFT_ACTION: 'draft_action', // Client -> Server: { type: 'ban'|'pick', charId: string }
  TIMER_UPDATE: 'timer_update',
} as const;
