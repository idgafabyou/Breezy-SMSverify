import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Wallet, 
  Smartphone, 
  User, 
  LogOut, 
  Plus, 
  Menu
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <div className={`
          flex flex-col items-center justify-center space-y-1 w-full h-full py-2 cursor-pointer transition-colors
          ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}
        `}>
          <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} />
          <span className="text-[10px] font-medium">{label}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/30 backdrop-blur-md p-6 sticky top-0 h-screen">
        <div className="flex items-center space-x-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
            B
          </div>
          <span className="text-xl font-display font-bold text-white tracking-tight">Breezy</span>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/">
            <Button variant={location === "/" ? "secondary" : "ghost"} className="w-full justify-start text-base h-12">
              <Home className="mr-3 w-5 h-5" /> Dashboard
            </Button>
          </Link>
          <Link href="/wallet">
            <Button variant={location === "/wallet" ? "secondary" : "ghost"} className="w-full justify-start text-base h-12">
              <Wallet className="mr-3 w-5 h-5" /> Wallet
            </Button>
          </Link>
          <Link href="/my-numbers">
            <Button variant={location === "/my-numbers" ? "secondary" : "ghost"} className="w-full justify-start text-base h-12">
              <Smartphone className="mr-3 w-5 h-5" /> My Numbers
            </Button>
          </Link>
          <Link href="/buy">
            <Button className="w-full justify-start mt-4 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 h-12">
              <Plus className="mr-3 w-5 h-5" /> Buy Number
            </Button>
          </Link>
        </nav>

        <div className="pt-6 border-t border-border">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold mr-3">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.username}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={() => logout()}>
            <LogOut className="mr-3 w-4 h-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              B
            </div>
            <span className="text-lg font-display font-bold text-white">Breezy</span>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] border-r border-white/10 bg-card text-foreground">
              <div className="flex flex-col h-full py-6">
                <div className="text-xl font-bold mb-8 font-display px-2">Menu</div>
                <nav className="space-y-2 flex-1">
                  <Link href="/">
                    <Button variant="ghost" className="w-full justify-start text-lg h-12">
                      <Home className="mr-4 w-5 h-5" /> Dashboard
                    </Button>
                  </Link>
                  <Link href="/wallet">
                    <Button variant="ghost" className="w-full justify-start text-lg h-12">
                      <Wallet className="mr-4 w-5 h-5" /> Wallet
                    </Button>
                  </Link>
                  <Link href="/my-numbers">
                    <Button variant="ghost" className="w-full justify-start text-lg h-12">
                      <Smartphone className="mr-4 w-5 h-5" /> My Numbers
                    </Button>
                  </Link>
                </nav>
                <Button variant="destructive" className="w-full justify-start" onClick={() => logout()}>
                  <LogOut className="mr-4 w-4 h-4" /> Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border h-16 flex items-center justify-around px-2 z-50 pb-safe">
        <NavItem href="/" icon={Home} label="Home" />
        <NavItem href="/my-numbers" icon={Smartphone} label="Numbers" />
        <div className="relative -top-5">
          <Link href="/buy">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/40 text-white cursor-pointer transform transition-transform active:scale-95">
              <Plus className="w-6 h-6 stroke-2" />
            </div>
          </Link>
        </div>
        <NavItem href="/wallet" icon={Wallet} label="Wallet" />
        <div 
          onClick={() => logout()}
          className="flex flex-col items-center justify-center space-y-1 w-full h-full py-2 cursor-pointer text-muted-foreground hover:text-foreground"
        >
          <User className="w-6 h-6 stroke-2" />
          <span className="text-[10px] font-medium">Profile</span>
        </div>
      </nav>
    </div>
  );
}
