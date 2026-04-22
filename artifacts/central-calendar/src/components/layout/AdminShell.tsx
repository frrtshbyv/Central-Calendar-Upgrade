import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAdminLogout, useAdminMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { CalendarDays, Archive, PlusCircle, LayoutDashboard, LogOut, Inbox, Newspaper, Settings as SettingsIcon, Image as ImageIcon, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminShell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: me } = useAdminMe();
  const logout = useAdminLogout();
  const { toast } = useToast();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        try { localStorage.removeItem("cc_admin_token"); } catch {}
        toast({ title: "Logged out successfully" });
        setLocation("/control-room-7f92x/login");
      },
    });
  };

  const isLoginPage = location === "/control-room-7f92x/login";
  if (isLoginPage) return <div className="min-h-screen bg-background">{children}</div>;

  const navItems = [
    { href: "/control-room-7f92x/events", label: "Events", icon: LayoutDashboard },
    { href: "/control-room-7f92x/events/new", label: "New Event", icon: PlusCircle },
    { href: "/control-room-7f92x/pending", label: "Pending Submissions", icon: Inbox },
    { href: "/control-room-7f92x/archive", label: "Archive", icon: Archive },
    { href: "/control-room-7f92x/articles", label: "Articles", icon: Newspaper },
    { href: "/control-room-7f92x/banners", label: "Hero Banners", icon: ImageIcon },
    { href: "/control-room-7f92x/translations", label: "Translations", icon: Languages },
    { href: "/control-room-7f92x/settings", label: "Site Settings", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-64 border-r border-border bg-card hidden md:block">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="font-bold text-primary tracking-tight">CONTROL ROOM</span>
        </div>
        <div className="p-4 flex flex-col gap-1">
          <div className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Management
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location === item.href || (item.href !== "/control-room-7f92x/events" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          <div className="mt-8 px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            System
          </div>
          <div className="px-3 py-2 text-sm text-muted-foreground">
            Logged in as
            <br />
            <span className="font-medium text-foreground">{me?.email}</span>
          </div>
          <Button variant="ghost" className="justify-start mt-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card flex items-center px-8 justify-between md:justify-end">
          <div className="md:hidden font-bold text-primary">CONTROL ROOM</div>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              View Public Site ↗
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
