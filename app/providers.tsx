"use client";

import { ReactNode } from "react";
import { http, createConfig, WagmiConfig } from "wagmi";
import { localhost } from "viem/chains";
import { metaMask } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const config = createConfig({
  connectors: [metaMask()], // ✅ clean and correct
  chains: [localhost],
  transports: {
    [localhost.id]: http(),
  },
  ssr: true,
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        {children}
      </WagmiConfig>
    </QueryClientProvider>
  );
}
