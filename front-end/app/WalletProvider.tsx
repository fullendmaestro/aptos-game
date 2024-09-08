"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";

import { PropsWithChildren } from "react";

const wallets = [new PetraWallet()];
export const WalletProvider = ({ children }: PropsWithChildren) => {
  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={true}
      optInWallets={["Petra"]}
      dappConfig={{
        network: "devnet",
      }}
      onError={(error) => {
        console.log("Aptos Wallet Adapter error", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};
