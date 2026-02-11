import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMatches, useCreateMatch, useJoinMatch } from "@/hooks/use-matches";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMatchSchema } from "@shared/schema";
import { z } from "zod";
import { Plus, Users, Clock, Gamepad2, PlayCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

const createMatchFormSchema = insertMatchSchema.pick({
  mode: true,
  banTime: true,
  prepTime: true,
});

type CreateMatchFormValues = z.infer<typeof createMatchFormSchema>;

export default function Lobby() {
  const { data: matches, isLoading } = useMatches();
  const { mutate: createMatch, isPending: isCreating } = useCreateMatch();
  const { mutate: joinMatch, isPending: isJoining } = useJoinMatch();
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  const form = useForm<CreateMatchFormValues>({
    resolver: zodResolver(createMatchFormSchema),
    defaultValues: {
      mode: "WhiWa",
      banTime: 300,
      prepTime: 420,
    },
  });

  const onSubmit = (data: CreateMatchFormValues) => {
    createMatch({ ...data, hostId: user!.id }, {
      onSuccess: (match) => {
        setOpen(false);
        setLocation(`/draft/${match.id}`);
      }
    });
  };

  const handleJoin = (matchId: number) => {
    joinMatch(matchId, {
      onSuccess: () => setLocation(`/draft/${matchId}`)
    });
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold">Lobby</h1>
            <p className="text-muted-foreground mt-2">Find a match or start your own.</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-5 w-5" /> Create Match
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-white/10">
              <DialogHeader>
                <DialogTitle>Create New Match</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                  <FormField
                    control={form.control}
                    name="mode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Game Mode</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="WhiWa">WhiWa Standard</SelectItem>
                            <SelectItem value="ToA">Tower of Adversity</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="banTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ban/Pick Time (s)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(+e.target.value)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="prepTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prep Time (s)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(+e.target.value)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Match"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
             <div className="text-center py-12 text-muted-foreground">Loading matches...</div>
          ) : matches?.length === 0 ? (
             <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-card/30">
               <Gamepad2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
               <h3 className="text-lg font-medium">No Active Matches</h3>
               <p className="text-muted-foreground">Be the first to create one!</p>
             </div>
          ) : (
            matches?.map((match) => (
              <Card key={match.id} className="bg-card/50 border-white/5 hover:border-primary/50 transition-all group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary font-bold border border-primary/30">
                      #{match.id}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-display">{match.mode} Match</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" /> 
                          {match.guestId ? "2/2 Players" : "1/2 Players"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {match.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {match.status === 'waiting' && !match.guestId && match.hostId !== user?.id ? (
                    <Button onClick={() => handleJoin(match.id)} disabled={isJoining} className="gap-2">
                      <PlayCircle className="w-4 h-4" /> Join Match
                    </Button>
                  ) : match.hostId === user?.id || match.guestId === user?.id ? (
                    <Button variant="secondary" onClick={() => setLocation(match.status === 'preparation' ? `/preparation/${match.id}` : `/draft/${match.id}`)} className="gap-2">
                      Rejoin
                    </Button>
                  ) : (
                    <Button variant="ghost" disabled>In Progress</Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
