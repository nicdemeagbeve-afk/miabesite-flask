"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Smartphone, Brain, MessageSquareText, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/ui/sidebar";

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
];

export function MainSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="w-64 p-4 fixed h-full">
      <div className="mb-8 text-2xl font-bold text-primary">Synapse AI</div>
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
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
    </Sidebar>
  );
}