"use client";

import { Home, Store, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const items = [
  { title: "My Subjects", url: "/dashboard", icon: Home },
  { title: "Marketplace", url: "/dashboard/marketplace", icon: Store },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const user = useQuery(api.auth.getCurrentUser);

  const imageUrl = useQuery(
    api.files.getUrl,
    user?.image && !user.image.startsWith("http")
      ? { storageId: user.image as Id<"_storage"> } 
      : "skip"
  );

  // 👈 1. If loading, show the Sidebar skeleton
  if (user === undefined) {
    return (
      <Sidebar className="[&>div]:bg-background">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
      </Sidebar>
    );
  }

  // 👈 2. If user is null (logged out/deleted), completely unmount the Sidebar
  if (user === null) {
    return null;
  }

  // 👈 3. If user exists, render the full Sidebar
  return (
    <Sidebar className="[&>div]:bg-background">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex items-center gap-3 overflow-hidden">
                <Avatar className="size-10 border-gray border-2 shadow-sm">
                  <AvatarImage
                    src={imageUrl || `https://avatar.vercel.sh/${user._id}`} 
                    alt={user.name}
                  />
                  <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold truncate">
                  {user.name}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={pathname === item.url}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}