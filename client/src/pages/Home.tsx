import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Swords, Trophy, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-3xl"
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4">
            Season 1 Now Live
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black font-display tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-2xl">
            WUTHERING<br />
            <span className="text-primary">WARFARE</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The ultimate PvP drafting tool for Wuthering Waves. Manage your roster, 
            challenge opponents, and master the meta in real-time drafting battles.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            {user ? (
              <Link href="/lobby">
                <Button size="lg" className="h-14 px-8 text-lg rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                  <Swords className="mr-2 h-5 w-5" /> Enter Lobby
                </Button>
              </Link>
            ) : (
              <a href="/api/auth/discord">
                <Button size="lg" className="h-14 px-8 text-lg rounded-xl bg-[#5865F2] hover:bg-[#4752C4] shadow-lg hover:shadow-xl transition-all">
                  Login with Discord
                </Button>
              </a>
            )}
            <Link href="/box">
               <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-xl border-white/10 hover:bg-white/5">
                 Manage Box
               </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-5xl">
          <FeatureCard 
            icon={<Users className="w-8 h-8 text-blue-400" />}
            title="Real-time Draft"
            desc="Live bans and picks with synchronized timers via Socket.IO."
          />
          <FeatureCard 
            icon={<Trophy className="w-8 h-8 text-yellow-400" />}
            title="Ranked Matches"
            desc="Compete in Tower of Adversity or WhiWa modes with custom rules."
          />
          <FeatureCard 
            icon={<Swords className="w-8 h-8 text-red-400" />}
            title="Strategic Prep"
            desc="Organize your teams and positions before the battle begins."
          />
        </div>
      </div>
    </Layout>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card/50 border border-white/5 backdrop-blur-sm hover:border-primary/50 transition-colors text-left group">
      <div className="mb-4 p-3 rounded-xl bg-white/5 w-fit group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
