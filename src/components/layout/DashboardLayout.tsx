import React from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { Home, Leaf, DollarSign, Truck, Cloud, Square, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Smart Fertilization", href: "/fertilization", icon: Leaf },
  { name: "Financial Planning", href: "/finance", icon: DollarSign },
  { name: "Supply Chain", href: "/supply-chain", icon: Truck },
  { name: "Weather", href: "/weather", icon: Cloud },
  { name: "Area Calculator", href: "/area-calculator", icon: Square },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-accent">
        <Sidebar className="border-r border-primary-200">
          <SidebarContent>
            <div className="px-3 py-4">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-primary-600">AgriSmart</h2>
              </div>
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-primary-600 hover:bg-primary-100 hover:text-primary-700 transition-colors"
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-100 hover:text-primary-700"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </Button>
              </nav>
            </div>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <SidebarTrigger className="mb-4" />
            <main className="animate-fade-in">{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}