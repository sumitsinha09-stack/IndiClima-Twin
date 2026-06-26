import React, { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Force dark mode for ClimateTwin India
    document.documentElement.classList.add("dark");
  }, []);

  return <>{children}</>;
}