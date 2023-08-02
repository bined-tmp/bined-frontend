"use client";

import { SessionProvider } from "next-auth/react";
import { FC, ReactNode } from "react";
import { ClientProvider } from "./client";

interface LayoutProps {
  children: ReactNode;
}

const Providers: FC<LayoutProps> = ({ children }) => {
  return (
    <SessionProvider>
      <ClientProvider>{children}</ClientProvider>
    </SessionProvider>
  );
};

export default Providers;
