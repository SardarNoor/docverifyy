"use client";

import { http, createConfig, WagmiConfig } from "wagmi";
import { localhost } from "viem/chains";
import { metaMask } from "wagmi/connectors";
import { ReactNode } from "react";

const config = createConfig({
  chains: [localhost],
  transports: {
    [localhost.id]: http(),
  },
  connectors: [metaMask()],
  ssr: true,
});

export function Providers({ children }: { children: ReactNode }) {
  return <WagmiConfig config={config}>{children}</WagmiConfig>;
}
