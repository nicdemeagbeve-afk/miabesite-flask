"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Smartphone, Brain, MessageSquareText, CreditCard, Shield, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthContext"; // Import useAuth
import { useRouter } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: "/", label: "Accueil/Statistiques", icon: LayoutDashboard },
  { href: "/whatsapp", label: "Mon WhatsApp", icon: Smartphone },
  { href: "/prompt-ia", label: "Prompt & IA", icon: Brain },
  { href: "/chat-history", label: "Historique des Chats", icon: MessageSquareText },
  { href: "/billing", label: "Facturation", icon: CreditCard },
  { href: "/admin", label: "Admin", icon: Shield },
];

export function MainSidebar() {
  const pathname = usePathname();
  const { userId, signOut, loading: authLoading } = useAuth(); // Use AuthContext
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login'); // Redirect to login page after sign out
  };

  // Don't render sidebar content until auth state is known
  if (authLoading) {
    return null;
  }

  return (
    <Sidebar className="w-64 p-4 fixed h-full flex flex-col">
      <div className="mb-8 text-2xl font-bold text-primary">Synapse AI</div>
      <nav className="flex flex-col space-y-2 flex-1"> {/* flex-1 to push logout to bottom */}
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {userId && ( // Only show logout button if user is logged in
        <div className="mt-auto pt-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Déconnexion
          </Button>
        </div>
      )}
    </Sidebar>
  );
}