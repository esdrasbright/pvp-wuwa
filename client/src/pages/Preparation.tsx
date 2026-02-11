import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { CharacterCard } from "@/components/CharacterCard";
import { Button } from "@/components/ui/button";
import { useMatch } from "@/hooks/use-matches";
import { useSocket } from "@/hooks/use-socket";
import { useAuth } from "@/hooks/use-auth";
import { CHARACTERS, getCharacter } from "@/lib/characters";
import { useParams, useLocation } from "wouter";
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Preparation() {
  const params = useParams<{ id: string }>();
  const matchId = parseInt(params.id!);
  const { data: match, isLoading } = useMatch(matchId);
  const { user } = useAuth();
  const { socket } = useSocket(matchId);
  const [_, setLocation] = useLocation();

  // Local state for team arrangement
  const [team1, setTeam1] = useState<string[]>(Array(3).fill(null));
  const [team2, setTeam2] = useState<string[]>(Array(3).fill(null));
  const [pool, setPool] = useState<string[]>([]);
  
  useEffect(() => {
    if (match && user) {
      const picks = match.picks?.[user.id] || [];
      setPool(picks);
    }
  }, [match, user]);

  if (isLoading || !match) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  const isHost = user?.id === match.hostId;
  const isGuest = user?.id === match.guestId;

  // Only participants can prep
  if (!isHost && !isGuest) {
     return <div className="h-screen flex items-center justify-center">Spectators waiting for prep...</div>;
  }

  const handleDragEnd = (event: DragEndEvent) => {
     // Implement DnD logic here (simplified for prompt constraints)
     // Move items between pool, team1, team2 arrays
  };

  return (
    <Layout>
       <div className="flex flex-col items-center gap-8 py-12">
          <h1 className="text-4xl font-display font-bold">Preparation Phase</h1>
          <div className="text-2xl font-mono text-primary">07:00</div>
          
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
             {/* Team 1 Slots */}
             <div className="bg-card/50 p-6 rounded-xl border border-white/10 min-h-[400px]">
                <h2 className="text-xl font-bold mb-4 text-center">Team 1</h2>
                <div className="space-y-4">
                   {team1.map((charId, idx) => (
                      <div key={idx} className="h-32 bg-black/40 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center">
                         {charId ? "Char" : "Empty Slot"}
                      </div>
                   ))}
                </div>
             </div>

             {/* Pool */}
             <div className="bg-card/50 p-6 rounded-xl border border-white/10 min-h-[400px]">
                <h2 className="text-xl font-bold mb-4 text-center">Your Picks</h2>
                <div className="grid grid-cols-2 gap-4">
                   {pool.map((charId) => {
                      const char = getCharacter(charId);
                      return char ? <CharacterCard key={charId} character={char} size="sm" /> : null;
                   })}
                </div>
             </div>

             {/* Team 2 Slots */}
             <div className="bg-card/50 p-6 rounded-xl border border-white/10 min-h-[400px]">
                <h2 className="text-xl font-bold mb-4 text-center">Team 2</h2>
                <div className="space-y-4">
                   {team2.map((charId, idx) => (
                      <div key={idx} className="h-32 bg-black/40 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center">
                         {charId ? "Char" : "Empty Slot"}
                      </div>
                   ))}
                </div>
             </div>
          </div>

          <Button size="lg" className="w-64">
             <Save className="mr-2 w-5 h-5" /> Submit Teams
          </Button>
       </div>
    </Layout>
  );
}
