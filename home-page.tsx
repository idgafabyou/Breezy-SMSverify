import { useAuth } from "@/hooks/use-auth";
import { useNumbers } from "@/hooks/use-numbers";
import { useWallet } from "@/hooks/use-wallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, ArrowUpRight, MessageSquare, Clock, Smartphone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function HomePage() {
  const { user } = useAuth();
  const { data: wallet, isLoading: isWalletLoading } = useWallet();
  const { data: numbers, isLoading: isNumbersLoading } = useNumbers();

  // Get active numbers
  const activeNumbers = numbers?.filter(n => n.status === 'active') || [];

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-2xl font-bold font-display">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.username}</p>
        </div>
        <Link href="/buy">
          <Button size="sm" className="hidden md:flex bg-primary hover:bg-primary/90">
            <Plus className="mr-2 w-4 h-4" /> Get Number
          </Button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Wallet Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-card relative overflow-hidden h-full border-none bg-gradient-to-br from-primary/20 to-emerald-900/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                Total Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isWalletLoading ? (
                <Skeleton className="h-10 w-24 bg-primary/10" />
              ) : (
                <div className="flex items-end justify-between">
                  <div className="text-4xl font-bold font-display tracking-tight text-white">
                    ${wallet?.balance || "0.00"}
                  </div>
                  <Link href="/wallet">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full mb-1">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Numbers Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Numbers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isNumbersLoading ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                <div className="flex items-end justify-between">
                  <div className="text-4xl font-bold font-display tracking-tight">
                    {activeNumbers.length}
                  </div>
                  <Smartphone className="h-8 w-8 text-muted-foreground/30 mb-1" />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Link href="/buy">
            <Card className="bg-card hover:bg-accent/50 transition-colors h-full cursor-pointer border-dashed border-2 border-border/50 hover:border-primary/50 group flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">New Number</h3>
              <p className="text-sm text-muted-foreground">Rent a line for verification</p>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* Recent Numbers List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display">Your Numbers</h2>
          <Link href="/my-numbers">
            <Button variant="link" className="text-primary h-auto p-0">View All</Button>
          </Link>
        </div>

        {isNumbersLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : activeNumbers.length === 0 ? (
          <Card className="glass-card p-12 text-center border-dashed">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Smartphone className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No active numbers</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              You don't have any virtual numbers yet. Purchase one to start receiving SMS verifications.
            </p>
            <Link href="/buy">
              <Button>Browse Marketplace</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-3">
            {activeNumbers.slice(0, 3).map((num) => (
              <Link key={num.id} href={`/numbers/${num.id}`}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Card className="hover:bg-accent/40 transition-colors cursor-pointer border border-border/50">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-mono font-semibold text-lg">{num.phoneNumber}</div>
                          <div className="flex items-center text-xs text-muted-foreground space-x-2">
                            <span className="capitalize">{num.service}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Expires soon
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</div>
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                          Active
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
