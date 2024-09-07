"use client";
import "./globals.css";
import { Fredoka } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { defineChain } from "viem";
import {
  zircuitTestnet,
  sepolia,
  seiDevnet,
  celoAlfajores,
  mantle,
} from "viem/chains";

const queryClient = new QueryClient();

const a0evm = defineChain({
  id: 2039,
  name: "Aleph Zero EVM Testnet",
  nativeCurrency: { name: "Azero", symbol: "AZERO", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.alephzero-testnet.gelato.digital"],
    },
  },
  blockExplorers: {
    default: {
      name: "EvmExplorer",
      url: "https://rpc.alephzero-testnet.gelato.digital",
    },
  },
});

const web3Metadata = {
  name: "AppKit",
  description: "AppKit Example",
  url: "https://web3modal.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const chains = [
  a0evm,
  zircuitTestnet,
  sepolia,
  seiDevnet,
  celoAlfajores,
  mantle,
] as const;
const config = defaultWagmiConfig({
  chains,
  projectId: process.env.NEXT_PUBLIC_WEB3_MODAL_PROJECT_ID!,
  metadata: web3Metadata,
});

createWeb3Modal({
  metadata: web3Metadata,
  wagmiConfig: config,
  projectId: process.env.NEXT_PUBLIC_WEB3_MODAL_PROJECT_ID!,
  enableAnalytics: true,
  themeMode: "dark",
});

const fredoka = Fredoka({ subsets: ["latin"] });

const metadata = {
  title: "bobr market",
  description: "bobr market",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:url" content="https://www.bobrmarket.xyz/" />
        <meta
          property="og:image"
          content="https://www.bobrmarket.xyz/logo.png"
        />
        <link rel="icon" href="/logo.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@bobrmarket" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta
          name="twitter:image"
          content="https://www.bobrmarket.xyz/logo.png"
        />
      </head>

      <body className={`${fredoka.className}`}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>

        <Toaster
          toastOptions={{
            className: "border-primaryGreen-50 border-2",
            style: {
              background: "black",
              color: "white",
              fontFamily: "Lato, sans-serif",
              fontSize: "12px",
            },
            position: "bottom-right",
          }}
        />
      </body>
    </html>
  );
}
