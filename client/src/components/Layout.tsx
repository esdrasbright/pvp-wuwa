import { Link, useLocation } from "wouter";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Box, Swords, Home } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { mutate: logout } = useLogout();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground">
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
             <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-display font-bold text-xl group-hover:scale-110 transition-transform">
               W
             </div>
             <span className="text-xl font-display font-bold tracking-wide hidden sm:block">Wave<span className="text-primary">Draft</span></span>
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/lobby">
                  <Button variant={location === "/lobby" ? "default" : "ghost"} size="sm" className="gap-2">
                    <Swords className="w-4 h-4" /> Lobby
                  </Button>
                </Link>
                <Link href="/box">
                  <Button variant={location === "/box" ? "default" : "ghost"} size="sm" className="gap-2">
                    <Box className="w-4 h-4" /> My Box
                  </Button>
                </Link>
                <div className="h-6 w-px bg-white/10 mx-2" />
                <div className="flex items-center gap-3">
                  {user.avatar && (
                    <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full border border-white/20" />
                  )}
                  <span className="text-sm font-medium hidden md:block">{user.username}</span>
                  <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout">
                    <LogOut className="w-4 h-4 text-muted-foreground hover:text-red-400 transition-colors" />
                  </Button>
                </div>
              </>
            ) : (
              <a href="/api/auth/discord">
                <Button className="bg-[#5865F2] hover:bg-[#4752C4] text-white">
                  Login with Discord
                </Button>
              </a>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-sm text-muted-foreground bg-black/20">
        <p>Unofficial Wuthering Waves PvP Tool</p>
      </footer>
    </div>
  );
}
