import { useRoute, Link, useLocation } from "wouter";
import { useNumbers, useNumberMessages, useCancelNumber } from "@/hooks/use-numbers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Copy, Trash2, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function NumberDetailsPage() {
  const [match, params] = useRoute("/numbers/:id");
  const [, setLocation] = useLocation();
  const id = parseInt(params?.id || "0");
  const { data: numbers } = useNumbers();
  const { data: messages, isLoading: isMsgsLoading } = useNumberMessages(id);
  const cancelMutation = useCancelNumber();
  const { toast } = useToast();

  const number = numbers?.find(n => n.id === id);

  if (!number && !numbers) return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;
  if (!number) return <div className="p-8">Number not found</div>;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(number.phoneNumber);
    toast({ title: "Copied!", description: "Phone number copied to clipboard" });
  };

  const handleCancel = async () => {
    await cancelMutation.mutateAsync(id);
    setLocation("/my-numbers");
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 h-full flex flex-col">
      <div className="flex items-center space-x-4 mb-2">
        <Link href="/my-numbers">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold font-display flex items-center gap-2">
            {number.phoneNumber}
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyToClipboard}>
              <Copy className="w-3 h-3" />
            </Button>
          </h1>
          <p className="text-sm text-muted-foreground capitalize">{number.service} • {number.country}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Messages Column */}
        <div className="lg:col-span-2 flex flex-col h-full min-h-[500px]">
          <Card className="flex-1 flex flex-col border-none bg-black/20 backdrop-blur-sm shadow-inner">
            <CardHeader className="bg-card/50 border-b border-border/50 backdrop-blur-md sticky top-0 z-10 flex flex-row items-center justify-between py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Inbox
              </CardTitle>
              {isMsgsLoading && <RefreshCcw className="w-4 h-4 animate-spin text-muted-foreground" />}
            </CardHeader>
            <CardContent className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
              {isMsgsLoading && !messages ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex flex-col space-y-2">
                       <Skeleton className="h-4 w-20 bg-white/5" />
                       <Skeleton className="h-20 w-full rounded-xl bg-white/5" />
                    </div>
                  ))}
                </div>
              ) : messages?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <p>Waiting for messages...</p>
                  <p className="text-xs">SMS will appear here automatically</p>
                </div>
              ) : (
                <AnimatePresence>
                  {messages?.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      layout
                    >
                      <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-primary font-mono text-xs px-2 py-0.5 bg-primary/10 rounded-full">
                            {msg.sender}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(msg.receivedAt || new Date()), "h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                          {msg.content}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Column */}
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm">Network Status</span>
                <span className="flex items-center text-emerald-500 text-sm font-semibold">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                  Online
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Expires In</span>
                  <span className="font-mono text-primary">14:59</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-3/4 rounded-full" />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full" size="lg">
                      <Trash2 className="w-4 h-4 mr-2" /> Cancel Number
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove this number from your account. You won't be able to receive any more messages on it.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Number</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancel} className="bg-destructive hover:bg-destructive/90">
                        Yes, Cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
