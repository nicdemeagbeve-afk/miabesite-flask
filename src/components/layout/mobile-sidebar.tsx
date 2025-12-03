"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { MainSidebar } from "./main-sidebar"; // Import the existing MainSidebar content

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <MainSidebar onLinkClick={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}