import { useState } from "react";
import { useWallet, useTransactions, useDeposit } from "@/hooks/use-wallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowDownLeft, ArrowUpRight, History, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function WalletPage() {
  const { data: wallet, isLoading: isWalletLoading } = useWallet();
  const { data: transactions, isLoading: isTxLoading } = useTransactions();
  const depositMutation = useDeposit();
  const [amount, setAmount] = useState("10.00");
  const [open, setOpen] = useState(false);

  const handleDeposit = () => {
    depositMutation.mutate(amount, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold font-display mb-6">My Wallet</h1>
        
        {/* Balance Card */}
        <Card className="glass-card overflow-hidden bg-gradient-to-br from-primary/30 to-background border-primary/20 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-sm font-medium text-primary-foreground/80 mb-1">Available Balance</p>
                {isWalletLoading ? (
                  <Skeleton className="h-12 w-48 bg-white/10" />
                ) : (
                  <h2 className="text-5xl font-display font-bold text-white tracking-tight">
                    ${wallet?.balance || "0.00"}
                  </h2>
                )}
              </div>
              
              <div className="flex space-x-3 w-full md:w-auto">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="flex-1 md:flex-none bg-white text-primary hover:bg-white/90 font-semibold shadow-lg">
                      <ArrowDownLeft className="mr-2 w-5 h-5" /> Deposit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Funds</DialogTitle>
                      <DialogDescription>
                        Top up your wallet to purchase virtual numbers.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Amount ($)</label>
                        <Input 
                          type="number" 
                          value={amount} 
                          onChange={(e) => setAmount(e.target.value)}
                          className="text-lg font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {["10.00", "25.00", "50.00"].map((val) => (
                          <Button 
                            key={val} 
                            variant="outline" 
                            onClick={() => setAmount(val)}
                            className={amount === val ? "border-primary text-primary bg-primary/5" : ""}
                          >
                            ${val}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleDeposit} disabled={depositMutation.isPending} className="w-full">
                        {depositMutation.isPending ? "Processing..." : "Confirm Deposit"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" size="lg" className="flex-1 md:flex-none bg-white/5 border-white/20 hover:bg-white/10 text-white">
                  <CreditCard className="mr-2 w-5 h-5" /> Cards
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions List */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <History className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Transaction History</h3>
        </div>

        <div className="space-y-3">
          {isTxLoading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
          ) : transactions?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl border-border">
              No transactions yet
            </div>
          ) : (
            transactions?.map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="hover:bg-accent/20 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}
                      `}>
                        {tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.createdAt || new Date()), "MMM d, yyyy • h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className={`font-mono font-semibold ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-foreground'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
