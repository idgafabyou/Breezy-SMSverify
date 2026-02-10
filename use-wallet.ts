import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useWallet() {
  return useQuery({
    queryKey: [api.wallet.balance.path],
    queryFn: async () => {
      const res = await fetch(api.wallet.balance.path);
      if (!res.ok) throw new Error("Failed to fetch balance");
      return api.wallet.balance.responses[200].parse(await res.json());
    },
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: [api.wallet.transactions.path],
    queryFn: async () => {
      const res = await fetch(api.wallet.transactions.path);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.wallet.transactions.responses[200].parse(await res.json());
    },
  });
}

export function useDeposit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (amount: string) => {
      const res = await fetch(api.wallet.deposit.path, {
        method: api.wallet.deposit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) throw new Error("Deposit failed");
      return api.wallet.deposit.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.wallet.balance.path] });
      queryClient.invalidateQueries({ queryKey: [api.wallet.transactions.path] });
      toast({
        title: "Deposit successful",
        description: "Funds have been added to your wallet.",
      });
    },
    onError: () => {
      toast({
        title: "Deposit failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });
}
