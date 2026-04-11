import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAdminLogout, useAdminMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { CalendarDays, Archive, PlusCircle, LayoutDashboard, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminShell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: me } = useAdminMe();
  const logout = useAdminLogout();
  const { toast } = useToast();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        toast({ title: "Logged out successfully" });
        setLocation("/control-room-7f92x/login");
      }
    });
  };

  // If not on login page but not authenticated (should be caught by ProtectedRoute, but just in case)
  const isLoginPage = location === "/control-room-7f92x/login";

  if (isLoginPage) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:block">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="font-bold text-primary tracking-tight">CONTROL ROOM</span>
        </div>
        <div className="p-4 flex flex-col gap-2">
          <div className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Management
          </div>
          
          <Link href="/control-room-7f92x/events" 
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location === "/control-room-7f92x/events" 
                ? "bg-primary text-primary-foreground" 
                : "text-foreground hover:bg-muted"
            }`}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          
          <Link href="/control-room-7f92x/events/new" 
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location === "/control-room-7f92x/events/new" 
                ? "bg-primary text-primary-foreground" 
                : "text-foreground hover:bg-muted"
            }`}>
            <PlusCircle className="h-4 w-4" />
            New Event
          </Link>
          
          <Link href="/control-room-7f92x/archive" 
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location === "/control-room-7f92x/archive" 
                ? "bg-primary text-primary-foreground" 
                : "text-foreground hover:bg-muted"
            }`}>
            <Archive className="h-4 w-4" />
            Archive
          </Link>

          <div className="mt-8 px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            System
          </div>
          
          <div className="px-3 py-2 text-sm text-muted-foreground">
            Logged in as<br/>
            <span className="font-medium text-foreground">{me?.email}</span>
          </div>
          
          <Button variant="ghost" className="justify-start mt-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card flex items-center px-8 justify-between md:justify-end">
          <div className="md:hidden font-bold text-primary">CONTROL ROOM</div>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              View Public Site ↗
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
