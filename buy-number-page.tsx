import { useState } from "react";
import { useAvailableNumbers, useBuyNumber } from "@/hooks/use-numbers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Send, Globe, ShoppingCart, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function BuyNumberPage() {
  const { data: available, isLoading } = useAvailableNumbers();
  const buyMutation = useBuyNumber();
  const [selectedService, setSelectedService] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Get unique services
  const services = Array.from(new Set(available?.map(n => n.service) || []));
  
  // Filter numbers based on selection
  const filteredNumbers = available?.filter(n => {
    const matchesService = selectedService ? n.service === selectedService : true;
    const matchesSearch = n.country.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesService && matchesSearch;
  }) || [];

  const handleBuy = (service: string, country: string) => {
    buyMutation.mutate({ service, country });
  };

  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case 'whatsapp': return <MessageCircle className="w-5 h-5 text-green-500" />;
      case 'telegram': return <Send className="w-5 h-5 text-blue-400" />;
      default: return <Globe className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Marketplace</h1>
          <p className="text-muted-foreground">Select a service and country to get started</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search country..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {services.map(s => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))
        ) : filteredNumbers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No numbers found matching your criteria.
          </div>
        ) : (
          filteredNumbers.map((item, idx) => (
            <motion.div
              key={`${item.service}-${item.country}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:border-primary/50 transition-colors duration-300">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                        {getServiceIcon(item.service)}
                      </div>
                      <div>
                        <h3 className="font-bold capitalize text-lg">{item.country}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{item.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary font-mono">${item.cost}</div>
                      <div className="text-xs text-muted-foreground">per number</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-xs text-muted-foreground bg-accent/50 p-2 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                      High success rate
                    </div>
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20"
                      onClick={() => handleBuy(item.service, item.country)}
                      disabled={buyMutation.isPending}
                    >
                      {buyMutation.isPending ? "Processing..." : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" /> Buy Now
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
