import { cn } from "@/lib/utils";
import { type Character } from "@/lib/characters";
import { Lock } from "lucide-react";

interface CharacterCardProps {
  character: Character;
  owned?: boolean;
  sequences?: number;
  selected?: boolean;
  banned?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  showSequences?: boolean;
  highlight?: boolean;
}

export function CharacterCard({ 
  character, 
  owned = true, 
  sequences = 0, 
  selected, 
  banned, 
  disabled, 
  onClick,
  size = "md",
  showSequences = true,
  highlight
}: CharacterCardProps) {
  
  const sizeClasses = {
    sm: "w-16 h-20 text-[10px]",
    md: "w-24 h-32 text-xs",
    lg: "w-32 h-44 text-sm",
  };

  const rarityColor = character.rarity === 5 ? "border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]" : "border-purple-500/50";
  const elementColors: Record<string, string> = {
    Aero: "bg-green-500",
    Glacio: "bg-cyan-400",
    Electro: "bg-purple-500",
    Fusion: "bg-orange-500",
    Havoc: "bg-rose-900",
    Spectro: "bg-yellow-200 text-black",
  };

  return (
    <div 
      onClick={!disabled ? onClick : undefined}
      className={cn(
        "relative rounded-lg overflow-hidden border-2 bg-card transition-all duration-200 group cursor-pointer select-none",
        sizeClasses[size],
        rarityColor,
        selected && "ring-2 ring-primary scale-105 z-10",
        banned && "grayscale opacity-50 cursor-not-allowed",
        disabled && "opacity-50 cursor-not-allowed",
        highlight && "ring-2 ring-white scale-110 z-10 shadow-xl",
        !owned && "opacity-60 grayscale",
        "hover:brightness-110 active:scale-95"
      )}
    >
      {/* Background Image */}
      <img 
        src={character.image} 
        alt={character.name} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* Rarity & Element Badge (Top Right) */}
      <div className="absolute top-1 right-1 flex gap-1">
        <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shadow-sm", elementColors[character.element])}>
          {character.element[0]}
        </div>
      </div>

      {/* Not Owned Overlay */}
      {!owned && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <Lock className="w-6 h-6 text-white/50" />
        </div>
      )}

      {/* Banned Overlay */}
      {banned && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-full bg-red-600/90 text-white text-center font-bold py-1 transform -rotate-12 shadow-lg border-y border-red-400">
            BANNED
          </div>
        </div>
      )}

      {/* Bottom Info */}
      <div className="absolute bottom-0 w-full p-2 flex flex-col items-center">
        <span className="text-white font-bold truncate w-full text-center drop-shadow-md font-display tracking-wide">
          {character.name}
        </span>
        {showSequences && owned && (
          <div className="flex gap-0.5 mt-0.5">
             <span className={cn(
               "px-1.5 py-0.5 rounded text-[10px] font-bold border border-white/20 backdrop-blur-sm",
               sequences >= 6 ? "bg-primary text-white" : "bg-black/50 text-gray-300"
             )}>
               S{sequences}
             </span>
          </div>
        )}
      </div>
    </div>
  );
}
