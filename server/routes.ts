import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { WS_EVENTS } from "@shared/schema";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { z } from "zod";

const pgSession = connectPg(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === Session Setup ===
  app.use(session({
    store: new pgSession({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || "wuthering-waves-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // === Passport Configuration ===
  // Mock Discord Auth if no ID/Secret provided (for development without keys)
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    console.warn("Discord credentials missing. Using Mock Strategy.");
    // We'll skip actual passport-discord setup and just mock the auth routes
    // for testing purposes if keys aren't present.
    // In a real scenario, we'd fail or require keys. 
    // For this environment, let's allow a dev-login.
  } else {
    passport.use(new DiscordStrategy({
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: "/auth/discord/callback",
      scope: ["identify"]
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await storage.getUserByDiscordId(profile.id);
        if (!user) {
          user = await storage.createUser({
            discordId: profile.id,
            username: profile.username,
            avatar: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
            box: {}
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }));
  }

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // === Auth Routes ===
  app.get("/auth/discord", passport.authenticate("discord"));
  app.get("/auth/discord/callback", 
    passport.authenticate("discord", { failureRedirect: "/" }),
    (req, res) => res.redirect("/lobby")
  );
  
  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // === Dev Login Route (Only if no discord keys) ===
  if (!process.env.DISCORD_CLIENT_ID) {
    app.get("/auth/dev-login", async (req, res) => {
      const username = (req.query.username as string) || "DevUser";
      const discordId = "dev-" + Math.floor(Math.random() * 10000);
      let user = await storage.getUserByDiscordId(discordId);
      if (!user) {
        user = await storage.createUser({
          discordId,
          username,
          avatar: "https://placehold.co/150",
          box: {}
        });
      }
      req.login(user, (err) => {
        if (err) return res.status(500).send(err);
        res.redirect("/lobby");
      });
    });
  }

  // === API Routes ===
  
  // Box
  app.put(api.users.updateBox.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    try {
      const input = api.users.updateBox.input.parse(req.body);
      const updatedUser = await storage.updateUserBox(user.id, input.box);
      res.json(updatedUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Matches
  app.get(api.matches.list.path, async (req, res) => {
    const matches = await storage.getMatches();
    res.json(matches);
  });

  app.post(api.matches.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    try {
      const input = api.matches.create.input.parse(req.body);
      const match = await storage.createMatch({
        ...input,
        hostId: user.id
      });
      res.status(201).json(match);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.matches.get.path, async (req, res) => {
    const match = await storage.getMatch(Number(req.params.id));
    if (!match) return res.status(404).json({ message: "Match not found" });
    res.json(match);
  });

  app.post(api.matches.join.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const matchId = Number(req.params.id);
    const match = await storage.getMatch(matchId);
    
    if (!match) return res.status(404).json({ message: "Match not found" });
    if (match.hostId === user.id) return res.json(match); // Already host
    if (match.guestId) return res.status(400).json({ message: "Match full" });
    
    const updated = await storage.joinMatch(matchId, user.id);
    res.json(updated);
  });

  // === Socket.IO ===
  const io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on(WS_EVENTS.JOIN_MATCH, async (matchId: number) => {
      socket.join(`match_${matchId}`);
      // Send current state
      const match = await storage.getMatch(matchId);
      if (match) {
        socket.emit(WS_EVENTS.UPDATE_MATCH, match);
      }
    });

    socket.on(WS_EVENTS.DRAFT_ACTION, async (data: { matchId: number, type: 'ban' | 'pick', charId: string, userId: number }) => {
      // In a real app, strict validation of turn order would happen here.
      // For this MVP, we assume the client checks turn, but we should verify basics.
      const match = await storage.getMatch(data.matchId);
      if (!match) return;

      // Update match state logic (Simplified for MVP)
      // We would update `match.bans`, `match.picks`, switch turn, etc.
      
      // ... Logic to update match state in DB ...
      // For MVP, we will just broadcast what happened to let clients update optimistic UI
      // In a real app, we MUST persist to DB and emit new DB state.
      
      // Let's implement basic turn switching and persisting:
      let updates: any = {};
      const { bans, picks } = match;
      
      if (data.type === 'ban') {
        const userBans = bans?.[data.userId] || [];
        userBans.push(data.charId);
        updates.bans = { ...bans, [data.userId]: userBans };
      } else {
        const userPicks = picks?.[data.userId] || [];
        userPicks.push(data.charId);
        updates.picks = { ...picks, [data.userId]: userPicks };
      }

      // Switch turn logic (Very basic toggle)
      if (match.hostId && match.guestId) {
        updates.currentTurn = (match.currentTurn === match.hostId) ? match.guestId : match.hostId;
      }

      const updatedMatch = await storage.updateMatch(data.matchId, updates);
      io.to(`match_${data.matchId}`).emit(WS_EVENTS.UPDATE_MATCH, updatedMatch);
    });
  });

  return httpServer;
}
