import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { CharacterCard } from "@/components/CharacterCard";
import { Button } from "@/components/ui/button";
import { useMatch } from "@/hooks/use-matches";
import { useSocket } from "@/hooks/use-socket";
import { useAuth } from "@/hooks/use-auth";
import { CHARACTERS, getCharacter } from "@/lib/characters";
import { useParams, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Loader2, ShieldBan, Swords } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DraftRoom() {
  const params = useParams<{ id: string }>();
  const matchId = parseInt(params.id!);
  const { data: match, isLoading } = useMatch(matchId);
  const { user } = useAuth();
  const { socket, emitDraftAction } = useSocket(matchId);
  const [_, setLocation] = useLocation();

  // Redirect to prep room if phase changes
  useEffect(() => {
    if (match?.status === "preparation") {
      setLocation(`/preparation/${matchId}`);
    }
  }, [match?.status, matchId, setLocation]);

  if (isLoading || !match) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  const isHost = user?.id === match.hostId;
  const isGuest = user?.id === match.guestId;
  const isSpectator = !isHost && !isGuest;
  
  const currentTurnPlayerId = match.currentTurn;
  const isMyTurn = user?.id === currentTurnPlayerId;
  
  // Phase logic
  const phase = match.currentPhase || "waiting";
  const isBanPhase = phase.startsWith("ban");
  
  // Data extraction
  const hostPicks = match.picks?.[match.hostId!] || [];
  const guestPicks = match.picks?.[match.guestId!] || [];
  const hostBans = match.bans?.[match.hostId!] || [];
  const guestBans = match.bans?.[match.guestId!] || [];
  
  const allPicked = new Set([...hostPicks, ...guestPicks]);
  const allBanned = new Set([...hostBans, ...guestBans]);

  const handleCardClick = (charId: string) => {
    if (!isMyTurn) return;
    if (allPicked.has(charId) || allBanned.has(charId)) return;
    
    const type = isBanPhase ? 'ban' : 'pick';
    emitDraftAction(type, charId);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* HEADER INFO */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/40 backdrop-blur-sm z-50">
        <h1 className="font-display font-bold text-xl tracking-wider">
          MATCH <span className="text-primary">#{match.id}</span>
        </h1>
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold uppercase text-muted-foreground tracking-widest">{match.mode} MODE</span>
          <div className="text-xs text-muted-foreground">{isSpectator ? "SPECTATING" : "PLAYING"}</div>
        </div>
        <div className="w-20" /> {/* Spacer */}
      </div>

      <div className="flex-1 flex flex-col relative">
        
        {/* HOST AREA (TOP) */}
        <div className={cn(
          "h-48 flex items-center justify-between px-12 transition-colors duration-500 relative border-b border-white/5",
          currentTurnPlayerId === match.hostId ? "bg-primary/10" : "bg-black/20"
        )}>
           {/* Host Profile */}
           <div className="flex items-center gap-4">
             <div className={cn("w-20 h-20 rounded-xl bg-gray-800 border-2 overflow-hidden", currentTurnPlayerId === match.hostId ? "border-primary shadow-[0_0_20px_rgba(124,58,237,0.3)]" : "border-white/10")}>
                {/* Avatar */}
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-gray-700 to-gray-900">P1</div>
             </div>
             <div>
               <div className="text-2xl font-bold font-display">HOST</div>
               {currentTurnPlayerId === match.hostId && (
                 <div className="text-primary font-bold animate-pulse text-sm uppercase tracking-widest mt-1">Thinking...</div>
               )}
             </div>
           </div>

           {/* Host Bans */}
           <div className="flex gap-2">
              <span className="writing-vertical-rl text-[10px] font-bold text-red-500 uppercase tracking-widest mr-2 opacity-50">Bans</span>
              <div className="flex gap-2">
                {[0, 1].map(i => {
                   const charId = hostBans[i];
                   const char = charId ? getCharacter(charId) : null;
                   return (
                     <div key={i} className="w-16 h-20 bg-black/40 border border-red-900/30 rounded flex items-center justify-center relative overflow-hidden">
                        {char ? (
                          <>
                             <img src={char.image} className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale" />
                             <ShieldBan className="w-6 h-6 text-red-500 z-10" />
                          </>
                        ) : <ShieldBan className="w-4 h-4 text-white/10" />}
                     </div>
                   );
                })}
              </div>
           </div>
        </div>

        {/* MIDDLE AREA - DRAFT GRID & TIMER */}
        <div className="flex-1 flex overflow-hidden">
           
           {/* LEFT - HOST PICKS */}
           <div className="w-64 bg-black/20 border-r border-white/5 p-4 flex flex-col gap-2 overflow-y-auto">
              <h3 className="text-center font-display font-bold text-muted-foreground text-sm mb-2">HOST PICKS</h3>
              {Array.from({length: 6}).map((_, i) => {
                 const charId = hostPicks[i];
                 const char = charId ? getCharacter(charId) : null;
                 return (
                   <div key={i} className="h-24 w-full bg-black/40 rounded border border-white/5 relative overflow-hidden group">
                     {char && (
                       <>
                         <img src={char.image} className="absolute inset-0 w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                         <span className="absolute bottom-2 left-2 font-bold z-10">{char.name}</span>
                       </>
                     )}
                   </div>
                 );
              })}
           </div>

           {/* CENTER - GRID */}
           <div className="flex-1 bg-black/50 p-6 flex flex-col relative">
              {/* STATUS BAR */}
              <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-center pointer-events-none z-20">
                 <div className="px-8 py-2 bg-black/80 border border-white/10 rounded-full backdrop-blur-xl flex items-center gap-4 shadow-2xl">
                    <div className="text-right">
                       <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Phase</div>
                       <div className="font-bold font-display text-xl uppercase text-white">{phase}</div>
                    </div>
                    <div className="h-8 w-px bg-white/20" />
                    <div className="text-left">
                       <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Turn</div>
                       <div className="font-bold font-display text-xl uppercase text-primary">
                          {isMyTurn ? "YOUR TURN" : (currentTurnPlayerId === match.hostId ? "HOST" : "GUEST")}
                       </div>
                    </div>
                 </div>
              </div>

              {/* GRID */}
              <div className="flex-1 overflow-y-auto pt-16 grid grid-cols-4 lg:grid-cols-6 gap-3 pr-2 scrollbar-thin">
                 {CHARACTERS.map(char => {
                   const isPicked = allPicked.has(char.id);
                   const isBanned = allBanned.has(char.id);
                   const disabled = isPicked || isBanned || !isMyTurn;
                   
                   // Determine sequence level to show for this user
                   // If spectating or opponent turn, technically we don't know THEIR box unless we fetch it.
                   // For now, let's just use user's own box for their view, or hide sequences if not owned.
                   const userBox = user?.box as Record<string, any> || {};
                   const seq = userBox[char.id]?.sequences || 0;
                   const owned = userBox[char.id]?.owned || false;

                   return (
                     <CharacterCard
                        key={char.id}
                        character={char}
                        owned={owned} // Only dim if not owned by viewer, logic can be improved to respect opponent box
                        sequences={seq}
                        disabled={disabled}
                        banned={isBanned}
                        selected={isPicked}
                        size="sm"
                        onClick={() => handleCardClick(char.id)}
                     />
                   );
                 })}
              </div>
           </div>

           {/* RIGHT - GUEST PICKS */}
           <div className="w-64 bg-black/20 border-l border-white/5 p-4 flex flex-col gap-2 overflow-y-auto">
              <h3 className="text-center font-display font-bold text-muted-foreground text-sm mb-2">GUEST PICKS</h3>
              {Array.from({length: 6}).map((_, i) => {
                 const charId = guestPicks[i];
                 const char = charId ? getCharacter(charId) : null;
                 return (
                   <div key={i} className="h-24 w-full bg-black/40 rounded border border-white/5 relative overflow-hidden">
                     {char && (
                       <>
                         <img src={char.image} className="absolute inset-0 w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-gradient-to-l from-black/80 to-transparent" />
                         <span className="absolute bottom-2 right-2 font-bold z-10">{char.name}</span>
                       </>
                     )}
                   </div>
                 );
              })}
           </div>
        </div>

        {/* GUEST AREA (BOTTOM) */}
        <div className={cn(
          "h-48 flex items-center justify-between px-12 transition-colors duration-500 relative border-t border-white/5",
          currentTurnPlayerId === match.guestId ? "bg-primary/10" : "bg-black/20"
        )}>
           {/* Guest Bans */}
           <div className="flex gap-2">
              <span className="writing-vertical-rl text-[10px] font-bold text-red-500 uppercase tracking-widest mr-2 opacity-50">Bans</span>
              <div className="flex gap-2">
                {[0, 1].map(i => {
                   const charId = guestBans[i];
                   const char = charId ? getCharacter(charId) : null;
                   return (
                     <div key={i} className="w-16 h-20 bg-black/40 border border-red-900/30 rounded flex items-center justify-center relative overflow-hidden">
                        {char ? (
                          <>
                             <img src={char.image} className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale" />
                             <ShieldBan className="w-6 h-6 text-red-500 z-10" />
                          </>
                        ) : <ShieldBan className="w-4 h-4 text-white/10" />}
                     </div>
                   );
                })}
              </div>
           </div>

           {/* Guest Profile */}
           <div className="flex items-center gap-4 text-right">
             <div>
               <div className="text-2xl font-bold font-display">GUEST</div>
               {currentTurnPlayerId === match.guestId && (
                 <div className="text-primary font-bold animate-pulse text-sm uppercase tracking-widest mt-1">Thinking...</div>
               )}
             </div>
             <div className={cn("w-20 h-20 rounded-xl bg-gray-800 border-2 overflow-hidden", currentTurnPlayerId === match.guestId ? "border-primary shadow-[0_0_20px_rgba(124,58,237,0.3)]" : "border-white/10")}>
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-gradient-to-tl from-gray-700 to-gray-900">P2</div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
