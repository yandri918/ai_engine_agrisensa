"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface NavContextType {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const NavContext = createContext<NavContextType>({
  isMobileOpen: false,
  setIsMobileOpen: () => {},
  toggleMobile: () => {},
  closeMobile: () => {},
});

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer whenever page route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <NavContext.Provider
      value={{
        isMobileOpen,
        setIsMobileOpen,
        toggleMobile,
        closeMobile,
      }}
    >
      {children}
    </NavContext.Provider>
  );
}

export const useNavigation = () => useContext(NavContext);
