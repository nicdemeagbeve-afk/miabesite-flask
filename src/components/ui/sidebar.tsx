"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full flex-col overflow-hidden border-r bg-sidebar text-sidebar-foreground",
      className
    )}
    {...props}
  />
));
Sidebar.displayName = "Sidebar";

export { Sidebar };