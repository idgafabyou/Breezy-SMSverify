import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useNumbers() {
  return useQuery({
    queryKey: [api.numbers.list.path],
    queryFn: async () => {
      const res = await fetch(api.numbers.list.path);
      if (!res.ok) throw new Error("Failed to fetch numbers");
      return api.numbers.list.responses[200].parse(await res.json());
    },
  });
}

export function useAvailableNumbers() {
  return useQuery({
    queryKey: [api.numbers.available.path],
    queryFn: async () => {
      const res = await fetch(api.numbers.available.path);
      if (!res.ok) throw new Error("Failed to fetch available numbers");
      return api.numbers.available.responses[200].parse(await res.json());
    },
  });
}

export function useNumberMessages(id: number) {
  return useQuery({
    queryKey: [api.messages.list.path, id],
    queryFn: async () => {
      const url = buildUrl(api.messages.list.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.messages.list.responses[200].parse(await res.json());
    },
    refetchInterval: 5000, // Poll every 5 seconds for new SMS
  });
}

export function useBuyNumber() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (data: { service: string; country: string }) => {
      const res = await fetch(api.numbers.buy.path, {
        method: api.numbers.buy.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.numbers.buy.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to purchase number");
      }
      return api.numbers.buy.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.numbers.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.wallet.balance.path] });
      toast({
        title: "Number Purchased!",
        description: "Your new virtual number is ready to use.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCancelNumber() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.numbers.cancel.path, { id });
      const res = await fetch(url, { method: api.numbers.cancel.method });
      if (!res.ok) throw new Error("Failed to cancel number");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.numbers.list.path] });
      toast({
        title: "Number Cancelled",
        description: "The number has been removed from your account.",
      });
    },
    onError: () => {
      toast({
        title: "Cancellation failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });
}
