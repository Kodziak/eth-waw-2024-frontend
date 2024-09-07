import { providers } from "ethers";
import { useMemo } from "react";
import { Config, useAccount, useClient, useConnectorClient } from "wagmi";
import { Client, Transport, Chain, Account } from "viem";

export const publicClientToProvider = () => {
  return new providers.Web3Provider((window as any).ethereum);
};

export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient<Config>({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}
