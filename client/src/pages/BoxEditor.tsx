import { Layout } from "@/components/Layout";
import { CharacterCard } from "@/components/CharacterCard";
import { Button } from "@/components/ui/button";
import { CHARACTERS } from "@/lib/characters";
import { useAuth, useUpdateBox } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Save, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function BoxEditor() {
  const { user } = useAuth();
  const { mutate: updateBox, isPending } = useUpdateBox();
  const { toast } = useToast();
  
  // Local state for box editing
  const [localBox, setLocalBox] = useState<Record<string, { owned: boolean, sequences: number }>>({});
  const [search, setSearch] = useState("");
  const [filterElement, setFilterElement] = useState<string | null>(null);

  // Initialize local box from user data
  useEffect(() => {
    if (user?.box) {
      setLocalBox(user.box);
    }
  }, [user]);

  const toggleOwned = (id: string) => {
    setLocalBox(prev => {
      const current = prev[id] || { owned: false, sequences: 0 };
      return {
        ...prev,
        [id]: { ...current, owned: !current.owned }
      };
    });
  };

  const updateSequences = (id: string, delta: number) => {
    setLocalBox(prev => {
      const current = prev[id] || { owned: true, sequences: 0 };
      const newSeq = Math.max(0, Math.min(6, current.sequences + delta));
      return {
        ...prev,
        [id]: { ...current, sequences: newSeq, owned: true } // Auto-own if sequences > 0
      };
    });
  };

  const handleSave = () => {
    updateBox({ box: localBox }, {
      onSuccess: () => {
        toast({ title: "Box Saved", description: "Your roster has been updated successfully." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to save box.", variant: "destructive" });
      }
    });
  };

  const filteredCharacters = CHARACTERS.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesElement = filterElement ? c.element === filterElement : true;
    return matchesSearch && matchesElement;
  });

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sticky top-20 z-40 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
          <div>
            <h1 className="text-3xl font-display font-bold">My Box</h1>
            <p className="text-sm text-muted-foreground">Manage your owned characters and sequences.</p>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap justify-end">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search characters..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-black/20"
              />
            </div>
            <Button onClick={handleSave} disabled={isPending} className="gap-2 bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4" /> {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
          {filteredCharacters.map(char => {
            const state = localBox[char.id] || { owned: false, sequences: 0 };
            
            return (
              <div key={char.id} className="relative group">
                <CharacterCard 
                  character={char} 
                  owned={state.owned} 
                  sequences={state.sequences}
                  onClick={() => toggleOwned(char.id)}
                  size="lg"
                />
                
                {/* Overlay Controls */}
                <div className="absolute inset-x-0 bottom-0 p-2 bg-black/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 rounded-b-lg">
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-gray-400">Sequence</span>
                    <span className="font-bold text-primary">S{state.sequences}</span>
                  </div>
                  <div className="flex gap-1 h-8">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-full flex-1 text-xs border-white/20 hover:bg-white/10"
                      onClick={(e) => { e.stopPropagation(); updateSequences(char.id, -1); }}
                    >
                      -
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-full flex-1 text-xs border-white/20 hover:bg-white/10"
                      onClick={(e) => { e.stopPropagation(); updateSequences(char.id, 1); }}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
