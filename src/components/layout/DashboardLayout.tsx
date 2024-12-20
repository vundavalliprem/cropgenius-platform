import React from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { Home, Leaf, DollarSign, Truck } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Smart Fertilization", href: "/fertilization", icon: Leaf },
  { name: "Financial Planning", href: "/finance", icon: DollarSign },
  { name: "Supply Chain", href: "/supply-chain", icon: Truck },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
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