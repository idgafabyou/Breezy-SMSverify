import { useNumbers } from "@/hooks/use-numbers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MessageSquare, Clock, Smartphone, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function MyNumbersPage() {
  const { data: numbers, isLoading } = useNumbers();
  const activeNumbers = numbers?.filter(n => n.status === 'active') || [];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-display">Active Numbers</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : activeNumbers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-border rounded-2xl bg-card/30">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No active numbers</h3>
          <p className="text-muted-foreground max-w-xs">
            You don't have any rentals active right now. Visit the marketplace to get started.
          </p>
          <Link href="/buy">
            <Button size="lg">Buy Number</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {activeNumbers.map((num, idx) => (
            <motion.div
              key={num.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link href={`/numbers/${num.id}`}>
                <Card className="hover:bg-accent/30 transition-all cursor-pointer group border-l-4 border-l-primary">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-mono text-xl font-semibold tracking-wide">
                          {num.phoneNumber}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                          <span className="capitalize px-2 py-0.5 rounded-md bg-background border border-border">
                            {num.service}
                          </span>
                          <span className="flex items-center text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {num.expiresAt ? formatDistanceToNow(new Date(num.expiresAt), { addSuffix: true }) : 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-muted-foreground group-hover:text-primary transition-colors">
                      <span className="text-sm mr-2 hidden md:inline">View Messages</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
